<?php

declare(strict_types=1);

namespace OCA\AnnouncementBanner\Service;

use InvalidArgumentException;
use OCA\AnnouncementBanner\AppInfo\Application;
use OCP\IConfig;

class ConfigService {
    private const KEY_ENABLED = 'banner_enabled';
    private const KEY_MESSAGE = 'message';
    private const KEY_MESSAGE_TRANSLATIONS = 'message_translations';
    private const KEY_VARIANT = 'variant';
    private const KEY_DISMISSIBLE = 'dismissible';
    private const KEY_READ_MORE_TEXT = 'read_more_text';
    private const KEY_READ_MORE_TEXT_TRANSLATIONS = 'read_more_text_translations';
    private const KEY_READ_MORE_URL = 'read_more_url';
    private const KEY_SCHEDULE_START = 'schedule_start';
    private const KEY_SCHEDULE_END = 'schedule_end';

    /**
     * @var string[]
     */
    private array $allowedVariants = ['danger', 'success', 'warning', 'info'];

    public function __construct(
        private IConfig $config,
    ) {
    }

    public function isEnabled(): bool {
        return $this->getEnabledFlag();
    }

    /**
     * @return array{enabled: bool, message: string, messageTranslations: array<string, string>, variant: string, dismissible: bool, readMoreText: string, readMoreTextTranslations: array<string, string>, readMoreUrl: string, scheduleStart: string, scheduleEnd: string}
     */
    public function getBannerSettings(): array {
        return [
            'enabled' => $this->getEnabledFlag(),
            'message' => $this->getAppValue(self::KEY_MESSAGE, ''),
            'messageTranslations' => $this->getTranslations(self::KEY_MESSAGE_TRANSLATIONS),
            'variant' => $this->normalizeVariant(
                $this->getAppValue(self::KEY_VARIANT, 'info')
            ),
            'dismissible' => $this->getAppValue(self::KEY_DISMISSIBLE, '1') === '1',
            'readMoreText' => $this->getAppValue(self::KEY_READ_MORE_TEXT, ''),
            'readMoreTextTranslations' => $this->getTranslations(self::KEY_READ_MORE_TEXT_TRANSLATIONS),
            'readMoreUrl' => $this->getAppValue(self::KEY_READ_MORE_URL, ''),
            'scheduleStart' => $this->getAppValue(self::KEY_SCHEDULE_START, ''),
            'scheduleEnd' => $this->getAppValue(self::KEY_SCHEDULE_END, ''),
        ];
    }

    /**
     * @return array{enabled: bool, message: string, messageTranslations: array<string, string>, variant: string, dismissible: bool, readMoreText: string, readMoreTextTranslations: array<string, string>, readMoreUrl: string, scheduleStart: string, scheduleEnd: string}
     */
    public function saveBannerSettings(
        bool $enabled,
        string $message,
        array $messageTranslations,
        string $variant,
        bool $dismissible,
        string $readMoreText,
        array $readMoreTextTranslations,
        string $readMoreUrl,
        string $scheduleStart,
        string $scheduleEnd,
    ): array {
        $message = trim($message);
        $messageTranslations = $this->normalizeTranslations($messageTranslations);
        $variant = $this->normalizeVariant($variant);
        $readMoreText = trim($readMoreText);
        $readMoreTextTranslations = $this->normalizeTranslations($readMoreTextTranslations);
        $readMoreUrl = trim($readMoreUrl);
        $scheduleStart = $this->normalizeScheduleValue($scheduleStart);
        $scheduleEnd = $this->normalizeScheduleValue($scheduleEnd);

        if ($scheduleStart !== '' && $scheduleEnd !== '') {
            $startTime = new \DateTimeImmutable($scheduleStart);
            $endTime = new \DateTimeImmutable($scheduleEnd);
            if ($startTime > $endTime) {
                throw new InvalidArgumentException('Schedule end must be after schedule start.');
            }
        }

        if ($enabled && $message === '') {
            throw new InvalidArgumentException('Message is required when the banner is enabled.');
        }

        $this->setAppValue(self::KEY_ENABLED, $enabled ? '1' : '0');
        $this->setAppValue(self::KEY_MESSAGE, $message);
        $this->setAppValue(self::KEY_MESSAGE_TRANSLATIONS, json_encode($messageTranslations) ?: '');
        $this->setAppValue(self::KEY_VARIANT, $variant);
        $this->setAppValue(self::KEY_DISMISSIBLE, $dismissible ? '1' : '0');
        $this->setAppValue(self::KEY_READ_MORE_TEXT, $readMoreText);
        $this->setAppValue(self::KEY_READ_MORE_TEXT_TRANSLATIONS, json_encode($readMoreTextTranslations) ?: '');
        $this->setAppValue(self::KEY_READ_MORE_URL, $readMoreUrl);
        $this->setAppValue(self::KEY_SCHEDULE_START, $scheduleStart);
        $this->setAppValue(self::KEY_SCHEDULE_END, $scheduleEnd);

        return $this->getBannerSettings();
    }

    /**
     * Generate a cache/dismiss key tied to the active banner content.
     */
    public function getDismissKey(?array $settings = null): string {
        $settings = $settings ?? $this->getBannerSettings();

        $message = $settings['message'] ?? '';
        $messageTranslations = $settings['messageTranslations'] ?? [];
        $variant = $settings['variant'] ?? 'info';
        $readMoreText = $settings['readMoreText'] ?? '';
        $readMoreTextTranslations = $settings['readMoreTextTranslations'] ?? [];
        $readMoreUrl = $settings['readMoreUrl'] ?? '';
        $scheduleStart = $settings['scheduleStart'] ?? '';
        $scheduleEnd = $settings['scheduleEnd'] ?? '';
        $enabled = $settings['enabled'] ?? false;
        $dismissible = $settings['dismissible'] ?? false;

        return md5(implode('|', [
            $message,
            $this->encodeTranslations($messageTranslations),
            $variant,
            $readMoreText,
            $this->encodeTranslations($readMoreTextTranslations),
            $readMoreUrl,
            $scheduleStart,
            $scheduleEnd,
            $enabled ? '1' : '0',
            $dismissible ? '1' : '0',
        ]));
    }

    private function normalizeVariant(string $variant): string {
        $variant = strtolower(trim($variant));

        if (!in_array($variant, $this->allowedVariants, true)) {
            return 'info';
        }

        return $variant;
    }

    /**
     * @return array<string, string>
     */
    private function getTranslations(string $key): array {
        $raw = $this->getAppValue($key, '');
        if ($raw === '') {
            return [];
        }

        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            return [];
        }

        $translations = [];
        foreach ($decoded as $locale => $value) {
            $translations[(string)$locale] = (string)$value;
        }

        return $this->normalizeTranslations($translations);
    }

    /**
     * @param array<string, mixed> $translations
     * @return array<string, string>
     */
    private function normalizeTranslations(array $translations): array {
        $normalized = [];

        foreach ($translations as $locale => $value) {
            $locale = strtolower(trim((string)$locale));
            $locale = str_replace('_', '-', $locale);
            if ($locale === '') {
                continue;
            }

            $message = trim((string)$value);
            if ($message === '') {
                continue;
            }

            $normalized[$locale] = $message;
        }

        ksort($normalized);

        return $normalized;
    }

    private function normalizeScheduleValue(string $value): string {
        $value = trim($value);
        if ($value === '') {
            return '';
        }

        try {
            $date = new \DateTimeImmutable($value);
        } catch (\Exception $e) {
            throw new InvalidArgumentException('Schedule value must be a valid date/time.');
        }

        return $date->format(\DateTimeInterface::ATOM);
    }

    /**
     * @param array<string, mixed> $translations
     */
    private function encodeTranslations(array $translations): string {
        if ($translations === []) {
            return '';
        }

        return json_encode($this->normalizeTranslations($translations)) ?: '';
    }

    private function getEnabledFlag(): bool {
        return $this->getAppValue(self::KEY_ENABLED, '0') === '1';
    }

    private function getAppValue(string $key, string $default = ''): string {
        return $this->config->getAppValue(Application::APP_ID, $key, $default);
    }

    private function setAppValue(string $key, string $value): void {
        $this->config->setAppValue(Application::APP_ID, $key, $value);
    }
}

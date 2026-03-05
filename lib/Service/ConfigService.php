<?php

declare(strict_types=1);

namespace OCA\AnnouncementBanner\Service;

use InvalidArgumentException;
use OCA\AnnouncementBanner\AppInfo\Application;
use OCP\IConfig;

class ConfigService {
    private const KEY_BANNERS = 'banners';
    private const KEY_BANNERS_MIGRATED = 'banners_migrated';

    private const KEY_ENABLED = 'banner_enabled';
    private const KEY_MESSAGE = 'message';
    private const KEY_MESSAGE_TRANSLATIONS = 'message_translations';
    private const KEY_VARIANT = 'variant';
    private const KEY_CUSTOM_BACKGROUND = 'custom_background';
    private const KEY_CUSTOM_TEXT = 'custom_text';
    private const KEY_TEXT_ALIGNMENT = 'text_alignment';
    private const KEY_DISMISSIBLE = 'dismissible';
    private const KEY_READ_MORE_TEXT = 'read_more_text';
    private const KEY_READ_MORE_TEXT_TRANSLATIONS = 'read_more_text_translations';
    private const KEY_READ_MORE_URL = 'read_more_url';
    private const KEY_SCHEDULE_START = 'schedule_start';
    private const KEY_SCHEDULE_END = 'schedule_end';

    /**
     * @var string[]
     */
    private array $allowedVariants = ['danger', 'success', 'warning', 'info', 'custom'];
    /**
     * @var string[]
     */
    private array $allowedTextAlignments = ['left', 'center', 'right'];

    public function __construct(
        private IConfig $config,
    ) {
    }

    public function hasEnabledBanners(): bool {
        foreach ($this->getBanners() as $banner) {
            if (!empty($banner['enabled'])) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getBanners(): array {
        $this->ensureLegacyMigration();
        return $this->loadBanners();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getBannersForAdmin(): array {
        $banners = $this->getBanners();
        $withStatus = [];
        foreach ($banners as $banner) {
            $withStatus[] = $this->withStatus($banner);
        }

        return $withStatus;
    }

    public function getBanner(string $id): ?array {
        foreach ($this->getBanners() as $banner) {
            if (($banner['id'] ?? '') === $id) {
                return $banner;
            }
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    public function createBanner(
        bool $enabled,
        string $message,
        array $messageTranslations,
        string $variant,
        string $customBackground,
        string $customText,
        string $textAlignment,
        bool $dismissible,
        string $readMoreText,
        array $readMoreTextTranslations,
        string $readMoreUrl,
        string $scheduleStart,
        string $scheduleEnd,
    ): array {
        $banners = $this->getBanners();
        $now = $this->getNow();
        $banner = $this->buildBanner(
            [
                'id' => $this->generateId(),
                'createdAt' => $now,
            ],
            $enabled,
            $message,
            $messageTranslations,
            $variant,
            $customBackground,
            $customText,
            $textAlignment,
            $dismissible,
            $readMoreText,
            $readMoreTextTranslations,
            $readMoreUrl,
            $scheduleStart,
            $scheduleEnd,
            $now,
        );
        $banners[] = $banner;
        $this->saveBanners($banners);

        return $this->withStatus($banner);
    }

    /**
     * @return array<string, mixed>
     */
    public function updateBanner(
        string $id,
        bool $enabled,
        string $message,
        array $messageTranslations,
        string $variant,
        string $customBackground,
        string $customText,
        string $textAlignment,
        bool $dismissible,
        string $readMoreText,
        array $readMoreTextTranslations,
        string $readMoreUrl,
        string $scheduleStart,
        string $scheduleEnd,
    ): array {
        $banners = $this->getBanners();
        $updated = null;
        $now = $this->getNow();

        foreach ($banners as $index => $banner) {
            if (($banner['id'] ?? '') !== $id) {
                continue;
            }

            $updated = $this->buildBanner(
                $banner,
                $enabled,
                $message,
                $messageTranslations,
                $variant,
                $customBackground,
                $customText,
                $textAlignment,
                $dismissible,
                $readMoreText,
                $readMoreTextTranslations,
                $readMoreUrl,
                $scheduleStart,
                $scheduleEnd,
                $now,
            );
            $banners[$index] = $updated;
            break;
        }

        if ($updated === null) {
            throw new InvalidArgumentException('Banner not found.');
        }

        $this->saveBanners($banners);

        return $this->withStatus($updated);
    }

    public function deleteBanner(string $id): void {
        $banners = $this->getBanners();
        $remaining = [];
        $deleted = false;

        foreach ($banners as $banner) {
            if (($banner['id'] ?? '') === $id) {
                $deleted = true;
                continue;
            }
            $remaining[] = $banner;
        }

        if (!$deleted) {
            throw new InvalidArgumentException('Banner not found.');
        }

        $this->saveBanners($remaining);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getPublicBanners(): array {
        $banners = [];
        foreach ($this->getBanners() as $banner) {
            if (empty($banner['enabled']) || empty($banner['message'])) {
                continue;
            }

            $banner['dismissKey'] = $this->getDismissKey($banner);
            $banners[] = $banner;
        }

        return $banners;
    }

    public function getDismissKey(?array $banner = null): string {
        $banner = $banner ?? [];

        $id = (string)($banner['id'] ?? '');
        $message = $banner['message'] ?? '';
        $messageTranslations = $banner['messageTranslations'] ?? [];
        $variant = $banner['variant'] ?? 'info';
        $customBackground = $banner['customBackground'] ?? '';
        $customText = $banner['customText'] ?? '';
        $textAlignment = $banner['textAlignment'] ?? 'left';
        $readMoreText = $banner['readMoreText'] ?? '';
        $readMoreTextTranslations = $banner['readMoreTextTranslations'] ?? [];
        $readMoreUrl = $banner['readMoreUrl'] ?? '';
        $scheduleStart = $banner['scheduleStart'] ?? '';
        $scheduleEnd = $banner['scheduleEnd'] ?? '';
        $enabled = $banner['enabled'] ?? false;
        $dismissible = $banner['dismissible'] ?? false;

        return md5(implode('|', [
            $id,
            $message,
            $this->encodeTranslations($messageTranslations),
            $variant,
            $customBackground,
            $customText,
            $textAlignment,
            $readMoreText,
            $this->encodeTranslations($readMoreTextTranslations),
            $readMoreUrl,
            $scheduleStart,
            $scheduleEnd,
            $enabled ? '1' : '0',
            $dismissible ? '1' : '0',
        ]));
    }

    /**
     * @return array<string, mixed>
     */
    public function getDefaultBanner(): array {
        return [
            'id' => '',
            'enabled' => false,
            'message' => '',
            'messageTranslations' => [],
            'variant' => 'info',
            'customBackground' => '',
            'customText' => '',
            'textAlignment' => 'left',
            'dismissible' => true,
            'readMoreText' => '',
            'readMoreTextTranslations' => [],
            'readMoreUrl' => '',
            'scheduleStart' => '',
            'scheduleEnd' => '',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function withStatus(array $banner): array {
        $banner['status'] = $this->getBannerStatus($banner);
        return $banner;
    }

    private function getBannerStatus(array $banner): string {
        if (empty($banner['enabled'])) {
            return 'disabled';
        }

        $now = new \DateTimeImmutable('now');
        $start = $this->parseStoredSchedule($banner['scheduleStart'] ?? '');
        $end = $this->parseStoredSchedule($banner['scheduleEnd'] ?? '');

        if ($start && $now < $start) {
            return 'scheduled';
        }

        if ($end && $now > $end) {
            return 'expired';
        }

        return 'active';
    }

    /**
     * @return array<string, mixed>
     */
    private function buildBanner(
        array $seed,
        bool $enabled,
        string $message,
        array $messageTranslations,
        string $variant,
        string $customBackground,
        string $customText,
        string $textAlignment,
        bool $dismissible,
        string $readMoreText,
        array $readMoreTextTranslations,
        string $readMoreUrl,
        string $scheduleStart,
        string $scheduleEnd,
        string $updatedAt,
    ): array {
        $message = trim($message);
        $messageTranslations = $this->normalizeTranslations($messageTranslations);
        $variant = $this->normalizeVariant($variant);
        $customBackground = $this->normalizeColor($customBackground);
        $customText = $this->normalizeColor($customText);
        $textAlignment = $this->normalizeTextAlignment($textAlignment);
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

        return [
            'id' => (string)($seed['id'] ?? $this->generateId()),
            'enabled' => $enabled,
            'message' => $message,
            'messageTranslations' => $messageTranslations,
            'variant' => $variant,
            'customBackground' => $customBackground,
            'customText' => $customText,
            'textAlignment' => $textAlignment,
            'dismissible' => $dismissible,
            'readMoreText' => $readMoreText,
            'readMoreTextTranslations' => $readMoreTextTranslations,
            'readMoreUrl' => $readMoreUrl,
            'scheduleStart' => $scheduleStart,
            'scheduleEnd' => $scheduleEnd,
            'createdAt' => (string)($seed['createdAt'] ?? $updatedAt),
            'updatedAt' => $updatedAt,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function loadBanners(): array {
        $raw = $this->getAppValue(self::KEY_BANNERS, '');
        if ($raw === '') {
            return [];
        }

        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            return [];
        }

        $banners = [];
        foreach ($decoded as $entry) {
            if (!is_array($entry)) {
                continue;
            }
            $banners[] = $this->normalizeStoredBanner($entry);
        }

        return $banners;
    }

    /**
     * @param array<int, array<string, mixed>> $banners
     */
    private function saveBanners(array $banners): void {
        $encoded = json_encode($banners);
        $this->setAppValue(self::KEY_BANNERS, $encoded ?: '[]');
    }

    /**
     * @return array<string, mixed>
     */
    private function normalizeStoredBanner(array $banner): array {
        $messageTranslations = $banner['messageTranslations'] ?? [];
        $readMoreTextTranslations = $banner['readMoreTextTranslations'] ?? [];

        return [
            'id' => (string)($banner['id'] ?? $this->generateId()),
            'enabled' => (bool)($banner['enabled'] ?? false),
            'message' => trim((string)($banner['message'] ?? '')),
            'messageTranslations' => $this->normalizeTranslations(is_array($messageTranslations) ? $messageTranslations : []),
            'variant' => $this->normalizeVariant((string)($banner['variant'] ?? 'info')),
            'customBackground' => $this->normalizeColor((string)($banner['customBackground'] ?? '')),
            'customText' => $this->normalizeColor((string)($banner['customText'] ?? '')),
            'textAlignment' => $this->normalizeTextAlignment((string)($banner['textAlignment'] ?? 'left')),
            'dismissible' => (bool)($banner['dismissible'] ?? true),
            'readMoreText' => trim((string)($banner['readMoreText'] ?? '')),
            'readMoreTextTranslations' => $this->normalizeTranslations(is_array($readMoreTextTranslations) ? $readMoreTextTranslations : []),
            'readMoreUrl' => trim((string)($banner['readMoreUrl'] ?? '')),
            'scheduleStart' => $this->normalizeStoredScheduleValue((string)($banner['scheduleStart'] ?? '')),
            'scheduleEnd' => $this->normalizeStoredScheduleValue((string)($banner['scheduleEnd'] ?? '')),
            'createdAt' => (string)($banner['createdAt'] ?? $this->getNow()),
            'updatedAt' => (string)($banner['updatedAt'] ?? $this->getNow()),
        ];
    }

    private function ensureLegacyMigration(): void {
        if ($this->getAppValue(self::KEY_BANNERS_MIGRATED, '0') === '1') {
            return;
        }

        if ($this->getAppValue(self::KEY_BANNERS, '') !== '') {
            $this->setAppValue(self::KEY_BANNERS_MIGRATED, '1');
            return;
        }

        $legacyEnabled = $this->getAppValue(self::KEY_ENABLED, '0') === '1';
        $legacyMessage = $this->getAppValue(self::KEY_MESSAGE, '');
        $legacyReadMoreText = $this->getAppValue(self::KEY_READ_MORE_TEXT, '');
        $legacyReadMoreUrl = $this->getAppValue(self::KEY_READ_MORE_URL, '');
        $legacyScheduleStart = $this->getAppValue(self::KEY_SCHEDULE_START, '');
        $legacyScheduleEnd = $this->getAppValue(self::KEY_SCHEDULE_END, '');
        $hasLegacyData = $legacyEnabled || $legacyMessage !== '' || $legacyReadMoreText !== '' || $legacyReadMoreUrl !== '' || $legacyScheduleStart !== '' || $legacyScheduleEnd !== '';

        if (!$hasLegacyData) {
            $this->setAppValue(self::KEY_BANNERS_MIGRATED, '1');
            return;
        }

        $now = $this->getNow();
        $banner = $this->buildBanner(
            [
                'id' => $this->generateId(),
                'createdAt' => $now,
            ],
            $legacyEnabled,
            $legacyMessage,
            $this->getTranslations(self::KEY_MESSAGE_TRANSLATIONS),
            $this->getAppValue(self::KEY_VARIANT, 'info'),
            '',
            '',
            $this->getAppValue(self::KEY_TEXT_ALIGNMENT, 'left'),
            $this->getAppValue(self::KEY_DISMISSIBLE, '1') === '1',
            $legacyReadMoreText,
            $this->getTranslations(self::KEY_READ_MORE_TEXT_TRANSLATIONS),
            $legacyReadMoreUrl,
            $legacyScheduleStart,
            $legacyScheduleEnd,
            $now,
        );

        $this->saveBanners([$banner]);
        $this->setAppValue(self::KEY_BANNERS_MIGRATED, '1');
    }

    private function normalizeVariant(string $variant): string {
        $variant = strtolower(trim($variant));

        if (!in_array($variant, $this->allowedVariants, true)) {
            return 'info';
        }

        return $variant;
    }

    private function normalizeColor(string $value): string {
        $value = trim($value);
        if ($value === '') {
            return '';
        }

        if (!preg_match('/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $value)) {
            return '';
        }

        return strtolower($value);
    }

    private function normalizeTextAlignment(string $alignment): string {
        $alignment = strtolower(trim($alignment));
        if (!in_array($alignment, $this->allowedTextAlignments, true)) {
            return 'left';
        }

        return $alignment;
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

    private function getAppValue(string $key, string $default = ''): string {
        return $this->config->getAppValue(Application::APP_ID, $key, $default);
    }

    private function setAppValue(string $key, string $value): void {
        $this->config->setAppValue(Application::APP_ID, $key, $value);
    }

    private function generateId(): string {
        return bin2hex(random_bytes(16));
    }

    private function getNow(): string {
        return (new \DateTimeImmutable('now'))->format(\DateTimeInterface::ATOM);
    }

    private function normalizeStoredScheduleValue(string $value): string {
        try {
            return $this->normalizeScheduleValue($value);
        } catch (InvalidArgumentException $e) {
            return '';
        }
    }

    private function parseStoredSchedule(string $value): ?\DateTimeImmutable {
        if ($value === '') {
            return null;
        }

        try {
            return new \DateTimeImmutable($value);
        } catch (\Exception $e) {
            return null;
        }
    }
}

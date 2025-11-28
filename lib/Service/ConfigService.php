<?php

declare(strict_types=1);

namespace OCA\AnnouncementBanner\Service;

use InvalidArgumentException;
use OCA\AnnouncementBanner\AppInfo\Application;
use OCP\IConfig;

class ConfigService {
    private const KEY_ENABLED = 'banner_enabled';
    private const KEY_MESSAGE = 'message';
    private const KEY_VARIANT = 'variant';
    private const KEY_DISMISSIBLE = 'dismissible';
    private const KEY_READ_MORE_TEXT = 'read_more_text';
    private const KEY_READ_MORE_URL = 'read_more_url';

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
     * @return array{enabled: bool, message: string, variant: string, dismissible: bool, readMoreText: string, readMoreUrl: string}
     */
    public function getBannerSettings(): array {
        return [
            'enabled' => $this->getEnabledFlag(),
            'message' => $this->getAppValue(self::KEY_MESSAGE, ''),
            'variant' => $this->normalizeVariant(
                $this->getAppValue(self::KEY_VARIANT, 'info')
            ),
            'dismissible' => $this->getAppValue(self::KEY_DISMISSIBLE, '1') === '1',
            'readMoreText' => $this->getAppValue(self::KEY_READ_MORE_TEXT, ''),
            'readMoreUrl' => $this->getAppValue(self::KEY_READ_MORE_URL, ''),
        ];
    }

    /**
     * @return array{enabled: bool, message: string, variant: string, dismissible: bool, readMoreText: string, readMoreUrl: string}
     */
    public function saveBannerSettings(
        bool $enabled,
        string $message,
        string $variant,
        bool $dismissible,
        string $readMoreText,
        string $readMoreUrl,
    ): array {
        $message = trim($message);
        $variant = $this->normalizeVariant($variant);
        $readMoreText = trim($readMoreText);
        $readMoreUrl = trim($readMoreUrl);

        if ($enabled && $message === '') {
            throw new InvalidArgumentException('Message is required when the banner is enabled.');
        }

        $this->setAppValue(self::KEY_ENABLED, $enabled ? '1' : '0');
        $this->setAppValue(self::KEY_MESSAGE, $message);
        $this->setAppValue(self::KEY_VARIANT, $variant);
        $this->setAppValue(self::KEY_DISMISSIBLE, $dismissible ? '1' : '0');
        $this->setAppValue(self::KEY_READ_MORE_TEXT, $readMoreText);
        $this->setAppValue(self::KEY_READ_MORE_URL, $readMoreUrl);

        return $this->getBannerSettings();
    }

    /**
     * Generate a cache/dismiss key tied to the active banner content.
     */
    public function getDismissKey(?array $settings = null): string {
        $settings = $settings ?? $this->getBannerSettings();

        $message = $settings['message'] ?? '';
        $variant = $settings['variant'] ?? 'info';
        $readMoreText = $settings['readMoreText'] ?? '';
        $readMoreUrl = $settings['readMoreUrl'] ?? '';
        $enabled = $settings['enabled'] ?? false;
        $dismissible = $settings['dismissible'] ?? false;

        return md5(implode('|', [
            $message,
            $variant,
            $readMoreText,
            $readMoreUrl,
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

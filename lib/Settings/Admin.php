<?php

declare(strict_types=1);

namespace OCA\AnnouncementBanner\Settings;

use OCA\AnnouncementBanner\AppInfo\Application;
use OCA\AnnouncementBanner\Service\ConfigService;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IL10N;
use OCP\Settings\ISettings;
use OCP\Util;

class Admin implements ISettings {
    public function __construct(
        private IL10N $l10n,
        private ConfigService $configService,
    ) {
    }

    public function getForm(): TemplateResponse {
        $settings = $this->configService->getBannerSettings();

        Util::addScript(Application::APP_ID, 'admin-settings');
        Util::addStyle(Application::APP_ID, 'banner');
        Util::addStyle(Application::APP_ID, 'admin');

        return new TemplateResponse(
            Application::APP_ID,
            'settings/admin',
            [
                'title' => $this->l10n->t('Announcement banner'),
                'helpText' => $this->l10n->t('The Announcement Banner app displays a customizable notification bar on every Nextcloud page, with your own message, a visual theme to highlight the type of announcement, and an optional link for more details. It offers a real-time preview of the banner, and your changes are shown to all users once they are saved.'),
                'labels' => [
                    'message' => $this->l10n->t('Banner message'),
                    'messagePlaceholder' => $this->l10n->t('What do you need everyone to know?'),
                    'variant' => $this->l10n->t('Color scheme'),
                    'variantRed' => $this->l10n->t('Danger'),
                    'variantGreen' => $this->l10n->t('Success'),
                    'variantWarning' => $this->l10n->t('Warning'),
                    'variantBlue' => $this->l10n->t('Info'),
                    'enable' => $this->l10n->t('Enable banner'),
                    'dismissible' => $this->l10n->t('Show dismiss icon (users can hide the banner)'),
                    'preview' => $this->l10n->t('Live preview'),
                    'readMoreText' => $this->l10n->t('Read more label'),
                    'readMoreTextPlaceholder' => $this->l10n->t('Optional link label, e.g. “Read more”'),
                    'readMoreUrl' => $this->l10n->t('Read more link'),
                    'readMoreUrlPlaceholder' => $this->l10n->t('Add a link for more details'),
                    'save' => $this->l10n->t('Save banner'),
                ],
                'settings' => $settings,
            ],
            TemplateResponse::RENDER_AS_BLANK
        );
    }

    public function getSection(): string {
        return Application::APP_ID;
    }

    public function getPriority(): int {
        return 10;
    }
}

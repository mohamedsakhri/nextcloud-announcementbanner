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
        $defaultBanner = $this->configService->getDefaultBanner();

        Util::addScript(Application::APP_ID, 'admin-settings');
        Util::addStyle(Application::APP_ID, 'banner');
        Util::addStyle(Application::APP_ID, 'admin');

        return new TemplateResponse(
            Application::APP_ID,
            'settings/admin',
            [
                'title' => $this->l10n->t('Announcement banner'),
                'helpText' => $this->l10n->t('The Announcement Banner app displays a customizable notification bar on every Nextcloud page, with your own message, a visual theme to highlight the type of announcement, and an optional link for more details. You can add translations so users see the banner in their language; otherwise the default message is shown. It offers a real-time preview of the banner, and your changes are shown to all users once they are saved.'),
                'labels' => [
                    'messages' => $this->l10n->t('Banners'),
                    'addBanner' => $this->l10n->t('Add new banner'),
                    'overviewNote' => $this->l10n->t('You can create multiple banners, schedule them, and manage them from this overview.'),
                    'status' => $this->l10n->t('Status'),
                    'message' => $this->l10n->t('Banner message'),
                    'messagePlaceholder' => $this->l10n->t('What do you need everyone to know?'),
                    'variant' => $this->l10n->t('Color scheme'),
                    'variantRed' => $this->l10n->t('Danger'),
                    'variantGreen' => $this->l10n->t('Success'),
                    'variantWarning' => $this->l10n->t('Warning'),
                    'variantBlue' => $this->l10n->t('Info'),
                    'variantCustom' => $this->l10n->t('Custom'),
                    'customBackground' => $this->l10n->t('Custom background color'),
                    'customText' => $this->l10n->t('Custom text color'),
                    'enable' => $this->l10n->t('Enable banner'),
                    'dismissible' => $this->l10n->t('Show dismiss icon (users can hide the banner)'),
                    'preview' => $this->l10n->t('Live preview'),
                    'previewColumn' => $this->l10n->t('Preview'),
                    'readMoreText' => $this->l10n->t('Read more label'),
                    'readMoreTextPlaceholder' => $this->l10n->t('Optional link label, e.g. “Read more”'),
                    'readMoreUrl' => $this->l10n->t('Read more link'),
                    'readMoreUrlPlaceholder' => $this->l10n->t('Add a link for more details'),
                    'scheduleStart' => $this->l10n->t('Schedule start (optional)'),
                    'scheduleEnd' => $this->l10n->t('Schedule end (optional)'),
                    'starts' => $this->l10n->t('Starts'),
                    'ends' => $this->l10n->t('Ends'),
                    'actions' => $this->l10n->t('Actions'),
                    'statusActive' => $this->l10n->t('Active'),
                    'statusScheduled' => $this->l10n->t('Scheduled'),
                    'statusExpired' => $this->l10n->t('Expired'),
                    'statusDisabled' => $this->l10n->t('Disabled'),
                    'editBanner' => $this->l10n->t('Edit banner'),
                    'deleteBanner' => $this->l10n->t('Delete banner'),
                    'newBanner' => $this->l10n->t('New banner'),
                    'backToOverview' => $this->l10n->t('Back to overview'),
                    'emptyState' => $this->l10n->t('No banners created yet'),
                    'translationsTitle' => $this->l10n->t('Translations'),
                    'translationsAddLabel' => $this->l10n->t('Add translation'),
                    'translationLangPlaceholder' => $this->l10n->t('Language code (e.g. en, de, fr)'),
                    'translationValuePlaceholder' => $this->l10n->t('Translation text'),
                    'translationRemoveLabel' => $this->l10n->t('Remove'),
                    'save' => $this->l10n->t('Save banner'),
                ],
                'availableTranslationLanguages' => [
                    'en' => 'English',
                    'es' => 'Español',
                    'fr' => 'Français',
                    'de' => 'Deutsch',
                    'it' => 'Italiano',
                    'pt' => 'Português',
                    'pt-br' => 'Português (Brasil)',
                    'nl' => 'Nederlands',
                    'pl' => 'Polski',
                    'ru' => 'Русский',
                    'tr' => 'Türkçe',
                    'ar' => 'العربية',
                    'hi' => 'हिन्दी',
                    'sv' => 'Svenska',
                    'ja' => '日本語',
                    'ko' => '한국어',
                    'zh-cn' => '中文 (简体)',
                    'zh-tw' => '中文 (繁體)',
                ],
                'settings' => $defaultBanner,
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

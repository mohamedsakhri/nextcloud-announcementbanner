<?php

declare(strict_types=1);

namespace OCA\AnnouncementBanner\Settings;

use OCA\AnnouncementBanner\AppInfo\Application;
use OCA\AnnouncementBanner\Service\ConfigService;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IL10N;
use OCP\Settings\IDelegatedSettings;
use OCP\Settings\ISettings;
use OCP\Util;

class Admin implements ISettings, IDelegatedSettings {
    public function __construct(
        private IL10N $l10n,
        private ConfigService $configService,
    ) {
    }

    public function getForm(): TemplateResponse {
        $defaultBanner = $this->configService->getDefaultBanner();

        Util::addScript(Application::APP_ID, 'banner-icons');
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
                    'overviewSortNote' => $this->l10n->t('Use the arrow buttons to change the order in which banners are shown.'),
                    'sectionContent' => $this->l10n->t('Content'),
                    'sectionAppearance' => $this->l10n->t('Appearance'),
                    'sectionSchedule' => $this->l10n->t('Schedule'),
                    'sectionTargeting' => $this->l10n->t('Targeting'),
                    'sectionBehavior' => $this->l10n->t('Behavior'),
                    'status' => $this->l10n->t('Status'),
                    'message' => $this->l10n->t('Banner message'),
                    'messagePlaceholder' => $this->l10n->t('What do you need everyone to know?'),
                    'icon' => $this->l10n->t('Icon'),
                    'variant' => $this->l10n->t('Color scheme'),
                    'variantRed' => $this->l10n->t('Danger'),
                    'variantGreen' => $this->l10n->t('Success'),
                    'variantWarning' => $this->l10n->t('Warning'),
                    'variantBlue' => $this->l10n->t('Info'),
                    'variantCustom' => $this->l10n->t('Custom'),
                    'customBackground' => $this->l10n->t('Custom background color'),
                    'customText' => $this->l10n->t('Custom text color'),
                    'textAlignment' => $this->l10n->t('Text alignment'),
                    'alignLeft' => $this->l10n->t('Left'),
                    'alignCenter' => $this->l10n->t('Center'),
                    'alignRight' => $this->l10n->t('Right'),
                    'enable' => $this->l10n->t('Enable banner'),
                    'dismissible' => $this->l10n->t('Show dismiss icon (users can hide the banner)'),
                    'preview' => $this->l10n->t('Live preview'),
                    'previewColumn' => $this->l10n->t('Preview'),
                    'readMoreText' => $this->l10n->t('Read more label'),
                    'readMoreTextPlaceholder' => $this->l10n->t('Optional link label, e.g. "Read more"'),
                    'readMoreUrl' => $this->l10n->t('Read more link'),
                    'readMoreUrlPlaceholder' => $this->l10n->t('Add a link for more details'),
                    'scheduleStart' => $this->l10n->t('Schedule start (optional)'),
                    'scheduleEnd' => $this->l10n->t('Schedule end (optional)'),
                    'audienceTarget' => $this->l10n->t('Audience'),
                    'audienceAll' => $this->l10n->t('Everyone'),
                    'audienceAdmins' => $this->l10n->t('Admins only'),
                    'audienceGroups' => $this->l10n->t('Specific groups'),
                    'audienceGroupsHelp' => $this->l10n->t('Select the groups that should see this banner.'),
                    'audienceGroupsRuleLabel' => $this->l10n->t('Show this banner to'),
                    'audienceGroupsRuleAnyOnly' => $this->l10n->t('Anyone in at least one selected group'),
                    'audienceGroupsRuleAllOnly' => $this->l10n->t('Only people in every selected group'),
                    'audienceGroupsRuleAnyExclude' => $this->l10n->t('Everyone except people in at least one selected group'),
                    'audienceGroupsRuleAllExclude' => $this->l10n->t('Everyone except people in every selected group'),
                    'apps' => $this->l10n->t('Pages'),
                    'allApps' => $this->l10n->t('All pages'),
                    'appTargets' => $this->l10n->t('Pages'),
                    'pageTargeting' => $this->l10n->t('Visible on'),
                    'pageTargetingMode' => $this->l10n->t('Visibility on pages'),
                    'pageTargetingAll' => $this->l10n->t('Show everywhere'),
                    'pageTargetingOnly' => $this->l10n->t('Show only on selected pages'),
                    'pageTargetingExclude' => $this->l10n->t('Show everywhere except selected pages'),
                    'appTargetsHelp' => $this->l10n->t('Select the pages affected by this targeting rule.'),
                    'appTargetsPlaceholder' => $this->l10n->t('Specific pages'),
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
                'availableIcons' => $this->configService->getAllowedIcons(),
                'iconLabels' => $this->getIconLabels(),
                'availableGroups' => $this->configService->getAvailableGroups(),
                'availableApps' => $this->configService->getAvailableApps(),
                'settings' => $defaultBanner,
            ],
            TemplateResponse::RENDER_AS_BLANK
        );
    }

    /**
     * Human-readable, translated labels for the icon picker. Keep the key set in
     * sync with ConfigService::getAllowedIcons(); any id missing here falls back
     * to its raw id in the template.
     *
     * @return array<string, string>
     */
    private function getIconLabels(): array {
        return [
            'megaphone' => $this->l10n->t('Megaphone'),
            'none' => $this->l10n->t('No icon'),
            'bullhorn' => $this->l10n->t('Bullhorn'),
            'bell' => $this->l10n->t('Bell'),
            'bell-ring' => $this->l10n->t('Ringing bell'),
            'alert' => $this->l10n->t('Alert'),
            'alert-circle' => $this->l10n->t('Alert (circle)'),
            'alert-octagon' => $this->l10n->t('Alert (octagon)'),
            'information' => $this->l10n->t('Information'),
            'information-outline' => $this->l10n->t('Information (outline)'),
            'check-circle' => $this->l10n->t('Check (circle)'),
            'check-decagram' => $this->l10n->t('Verified'),
            'close-circle' => $this->l10n->t('Close (circle)'),
            'close-octagon' => $this->l10n->t('Close (octagon)'),
            'shield-alert' => $this->l10n->t('Shield alert'),
            'shield-check' => $this->l10n->t('Shield check'),
            'lock' => $this->l10n->t('Lock'),
            'wrench' => $this->l10n->t('Wrench'),
            'progress-wrench' => $this->l10n->t('Maintenance in progress'),
            'broom' => $this->l10n->t('Broom'),
            'server' => $this->l10n->t('Server'),
            'server-off' => $this->l10n->t('Server offline'),
            'database' => $this->l10n->t('Database'),
            'cloud' => $this->l10n->t('Cloud'),
            'cloud-alert' => $this->l10n->t('Cloud alert'),
            'wifi-off' => $this->l10n->t('Wifi off'),
            'sync' => $this->l10n->t('Sync'),
            'update' => $this->l10n->t('Update'),
            'download' => $this->l10n->t('Download'),
            'upload' => $this->l10n->t('Upload'),
            'calendar' => $this->l10n->t('Calendar'),
            'calendar-clock' => $this->l10n->t('Scheduled event'),
            'clock-alert' => $this->l10n->t('Time-sensitive'),
            'email' => $this->l10n->t('Email'),
            'flag' => $this->l10n->t('Flag'),
            'star' => $this->l10n->t('Star'),
            'gift' => $this->l10n->t('Gift'),
            'party-popper' => $this->l10n->t('Celebration'),
            'rocket-launch' => $this->l10n->t('Launch'),
            'new-box' => $this->l10n->t('New'),
            'lightning-bolt' => $this->l10n->t('Lightning bolt'),
            'help-circle' => $this->l10n->t('Help'),
        ];
    }

    public function getSection(): string {
        return Application::APP_ID;
    }

    public function getPriority(): int {
        return 10;
    }

    public function getName(): ?string {
        return null;
    }

    public function getAuthorizedAppConfig(): array {
        return [
            Application::APP_ID => [
                'banners',
            ],
        ];
    }
}

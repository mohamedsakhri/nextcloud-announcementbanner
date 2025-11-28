<?php

declare(strict_types=1);

namespace OCA\AnnouncementBanner\Settings;

use OCA\AnnouncementBanner\AppInfo\Application;
use OCP\IL10N;
use OCP\IURLGenerator;
use OCP\Settings\IIconSection;

class Section implements IIconSection {
    public function __construct(
        private IL10N $l10n,
        private IURLGenerator $urlGenerator,
    ) {
    }

    public function getID(): string {
        return Application::APP_ID;
    }

    public function getName(): string {
        return $this->l10n->t('Announcement banner');
    }

    public function getPriority(): int {
        return 50;
    }

    public function getIcon(): string {
        return $this->urlGenerator->imagePath(Application::APP_ID, 'app-dark.svg');
    }
}

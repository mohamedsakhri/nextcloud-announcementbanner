<?php

declare(strict_types=1);

namespace OCA\AnnouncementBanner\AppInfo;

use OCA\AnnouncementBanner\Service\ConfigService;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\Util;

class Application extends App implements IBootstrap {
    public const APP_ID = 'announcementbanner';

    public function __construct(array $params = []) {
        parent::__construct(self::APP_ID, $params);
    }

    public function register(IRegistrationContext $context): void {
        // No additional services to register.
    }

    public function boot(IBootContext $context): void {
        Util::addTranslations(self::APP_ID);

        $configService = $this->getContainer()->get(ConfigService::class);
        if ($configService->hasEnabledBanners()) {
            Util::addScript(self::APP_ID, 'banner');
            Util::addStyle(self::APP_ID, 'banner');
        }
    }
}

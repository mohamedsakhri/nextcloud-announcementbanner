<?php

declare(strict_types=1);

namespace OCA\AnnouncementBanner\AppInfo;

use OCA\AnnouncementBanner\Service\ConfigService;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\IUserSession;
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
        $container = $context->getAppContainer();

        // Banners are only served to logged-in users, so guests (login page,
        // public share links) would only trigger a failing banner request.
        if (!$container->get(IUserSession::class)->isLoggedIn()) {
            return;
        }

        Util::addTranslations(self::APP_ID);

        if ($container->get(ConfigService::class)->hasActiveBanners()) {
            Util::addScript(self::APP_ID, 'banner-icons');
            Util::addScript(self::APP_ID, 'banner');
            Util::addStyle(self::APP_ID, 'banner');
        }
    }
}

<?php

declare(strict_types=1);

namespace OCA\AnnouncementBanner\Controller;

use InvalidArgumentException;
use OCA\AnnouncementBanner\Service\ConfigService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\Attribute\AdminRequired;
use OCP\AppFramework\Http\Attribute\CSRFRequired;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\DataResponse;
use OCP\IRequest;

class BannerController extends Controller {
    public function __construct(
        string $appName,
        IRequest $request,
        private ConfigService $configService,
    ) {
        parent::__construct($appName, $request);
    }

    #[NoAdminRequired]
    #[NoCSRFRequired]
    public function getBanner(): DataResponse {
        $settings = $this->configService->getBannerSettings();
        $settings['dismissKey'] = $this->configService->getDismissKey($settings);

        return new DataResponse($settings);
    }

    #[AdminRequired]
    #[CSRFRequired]
    public function saveBanner(): DataResponse {
        $enabled = filter_var($this->request->getParam('enabled', false), FILTER_VALIDATE_BOOLEAN);
        $dismissible = filter_var($this->request->getParam('dismissible', false), FILTER_VALIDATE_BOOLEAN);
        $message = (string)$this->request->getParam('message', '');
        $variant = (string)$this->request->getParam('variant', 'blue');
        $readMoreText = (string)$this->request->getParam('readMoreText', '');
        $readMoreUrl = (string)$this->request->getParam('readMoreUrl', '');

        try {
            $payload = $this->configService->saveBannerSettings(
                $enabled,
                $message,
                $variant,
                $dismissible,
                $readMoreText,
                $readMoreUrl,
            );
        } catch (InvalidArgumentException $e) {
            return new DataResponse(
                ['message' => $e->getMessage()],
                Http::STATUS_BAD_REQUEST
            );
        }

        return new DataResponse($payload);
    }
}

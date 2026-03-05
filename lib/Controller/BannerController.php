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
        return new DataResponse([
            'banners' => $this->configService->getPublicBanners(),
        ]);
    }

    #[AdminRequired]
    #[NoCSRFRequired]
    public function listBanners(): DataResponse {
        return new DataResponse($this->configService->getBannersForAdmin());
    }

    #[AdminRequired]
    #[NoCSRFRequired]
    public function getBannerDetails(string $id): DataResponse {
        $banner = $this->configService->getBanner($id);
        if ($banner === null) {
            return new DataResponse(['message' => 'Banner not found.'], Http::STATUS_NOT_FOUND);
        }

        return new DataResponse($banner);
    }

    #[AdminRequired]
    #[CSRFRequired]
    public function createBanner(): DataResponse {
        $payload = $this->readInput();
        $data = $this->extractBannerPayload($payload);

        try {
            $banner = $this->configService->createBanner(
                $data['enabled'],
                $data['message'],
                $data['messageTranslations'],
                $data['variant'],
                $data['customBackground'],
                $data['customText'],
                $data['textAlignment'],
                $data['dismissible'],
                $data['readMoreText'],
                $data['readMoreTextTranslations'],
                $data['readMoreUrl'],
                $data['scheduleStart'],
                $data['scheduleEnd'],
            );
        } catch (InvalidArgumentException $e) {
            return new DataResponse(
                ['message' => $e->getMessage()],
                Http::STATUS_BAD_REQUEST
            );
        }

        return new DataResponse($banner);
    }

    #[AdminRequired]
    #[CSRFRequired]
    public function updateBanner(string $id): DataResponse {
        $payload = $this->readInput();
        $data = $this->extractBannerPayload($payload);

        try {
            $banner = $this->configService->updateBanner(
                $id,
                $data['enabled'],
                $data['message'],
                $data['messageTranslations'],
                $data['variant'],
                $data['customBackground'],
                $data['customText'],
                $data['textAlignment'],
                $data['dismissible'],
                $data['readMoreText'],
                $data['readMoreTextTranslations'],
                $data['readMoreUrl'],
                $data['scheduleStart'],
                $data['scheduleEnd'],
            );
        } catch (InvalidArgumentException $e) {
            $code = $e->getMessage() === 'Banner not found.' ? Http::STATUS_NOT_FOUND : Http::STATUS_BAD_REQUEST;
            return new DataResponse(
                ['message' => $e->getMessage()],
                $code
            );
        }

        return new DataResponse($banner);
    }

    #[AdminRequired]
    #[CSRFRequired]
    public function deleteBanner(string $id): DataResponse {
        try {
            $this->configService->deleteBanner($id);
        } catch (InvalidArgumentException $e) {
            return new DataResponse(
                ['message' => $e->getMessage()],
                Http::STATUS_NOT_FOUND
            );
        }

        return new DataResponse(['id' => $id]);
    }

    /**
     * Merge form params with JSON body to support both content types.
     */
    private function readInput(): array {
        $params = $this->request->getParams();

        $contentType = $this->request->getHeader('Content-Type') ?? '';
        if (stripos($contentType, 'application/json') !== false) {
            $raw = @file_get_contents('php://input');
            if (is_string($raw) && $raw !== '') {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) {
                    $params = array_merge($params, $decoded);
                }
            }
        }

        return $params;
    }

    /**
     * @return array{enabled: bool, message: string, messageTranslations: array<string, string>, variant: string, customBackground: string, customText: string, textAlignment: string, dismissible: bool, readMoreText: string, readMoreTextTranslations: array<string, string>, readMoreUrl: string, scheduleStart: string, scheduleEnd: string}
     */
    private function extractBannerPayload(array $payload): array {
        return [
            'enabled' => filter_var($payload['enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'dismissible' => filter_var($payload['dismissible'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'message' => (string)($payload['message'] ?? ''),
            'messageTranslations' => $this->normalizeTranslations($payload['messageTranslations'] ?? []),
            'variant' => (string)($payload['variant'] ?? 'info'),
            'customBackground' => (string)($payload['customBackground'] ?? ''),
            'customText' => (string)($payload['customText'] ?? ''),
            'textAlignment' => (string)($payload['textAlignment'] ?? 'left'),
            'readMoreText' => (string)($payload['readMoreText'] ?? ''),
            'readMoreTextTranslations' => $this->normalizeTranslations($payload['readMoreTextTranslations'] ?? []),
            'readMoreUrl' => (string)($payload['readMoreUrl'] ?? ''),
            'scheduleStart' => (string)($payload['scheduleStart'] ?? ''),
            'scheduleEnd' => (string)($payload['scheduleEnd'] ?? ''),
        ];
    }

    /**
     * @return array<string, string>
     */
    private function normalizeTranslations(mixed $value): array {
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            $value = is_array($decoded) ? $decoded : [];
        }

        if (!is_array($value)) {
            return [];
        }

        $translations = [];
        foreach ($value as $locale => $message) {
            $translations[(string)$locale] = (string)$message;
        }

        return $translations;
    }
}

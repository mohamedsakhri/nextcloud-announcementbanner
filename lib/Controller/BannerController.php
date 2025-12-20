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
        $payload = $this->readInput();

        $enabled = filter_var($payload['enabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $dismissible = filter_var($payload['dismissible'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $message = (string)($payload['message'] ?? '');
        $messageTranslations = $this->normalizeTranslations($payload['messageTranslations'] ?? []);
        $variant = (string)($payload['variant'] ?? 'info');
        $readMoreText = (string)($payload['readMoreText'] ?? '');
        $readMoreTextTranslations = $this->normalizeTranslations($payload['readMoreTextTranslations'] ?? []);
        $readMoreUrl = (string)($payload['readMoreUrl'] ?? '');
        $scheduleStart = (string)($payload['scheduleStart'] ?? '');
        $scheduleEnd = (string)($payload['scheduleEnd'] ?? '');

        try {
            $payload = $this->configService->saveBannerSettings(
                $enabled,
                $message,
                $messageTranslations,
                $variant,
            $dismissible,
            $readMoreText,
            $readMoreTextTranslations,
            $readMoreUrl,
            $scheduleStart,
            $scheduleEnd,
        );
        } catch (InvalidArgumentException $e) {
            return new DataResponse(
                ['message' => $e->getMessage()],
                Http::STATUS_BAD_REQUEST
            );
        }

        return new DataResponse($payload);
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

<?php

declare(strict_types=1);

namespace OCA\AnnouncementBanner\Controller;

use InvalidArgumentException;
use OCA\AnnouncementBanner\Service\ConfigService;
use OCA\AnnouncementBanner\Settings\Admin;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\Attribute\AuthorizedAdminSetting;
use OCP\AppFramework\Http\Attribute\CSRFRequired;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\DataResponse;
use OCP\IGroupManager;
use OCP\IRequest;
use OCP\IUser;
use OCP\IUserSession;

class BannerController extends Controller {
    public function __construct(
        string $appName,
        IRequest $request,
        private ConfigService $configService,
        private IUserSession $userSession,
        private IGroupManager $groupManager,
    ) {
        parent::__construct($appName, $request);
    }

    #[NoAdminRequired]
    #[NoCSRFRequired]
    public function getBanner(): DataResponse {
        $user = $this->userSession->getUser();
        $currentAppId = (string)($this->request->getParam('appId', '') ?? '');

        return new DataResponse([
            'banners' => $this->configService->getPublicBanners(
                $user?->getUID(),
                $this->isAdminUser($user),
                $this->getViewerGroupIds($user),
                $currentAppId,
            ),
        ]);
    }

    #[AuthorizedAdminSetting(settings: Admin::class)]
    #[NoCSRFRequired]
    public function listBanners(): DataResponse {
        return new DataResponse($this->configService->getBannersForAdmin());
    }

    #[AuthorizedAdminSetting(settings: Admin::class)]
    #[NoCSRFRequired]
    public function getBannerDetails(string $id): DataResponse {
        $banner = $this->configService->getBanner($id);
        if ($banner === null) {
            return new DataResponse(['message' => 'Banner not found.'], Http::STATUS_NOT_FOUND);
        }

        return new DataResponse($banner);
    }

    #[AuthorizedAdminSetting(settings: Admin::class)]
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
                $data['audienceTarget'],
                $data['audienceGroups'],
                $data['targetAppMode'],
                $data['targetApps'],
            );
        } catch (InvalidArgumentException $e) {
            return new DataResponse(
                ['message' => $e->getMessage()],
                Http::STATUS_BAD_REQUEST
            );
        }

        return new DataResponse($banner);
    }

    #[AuthorizedAdminSetting(settings: Admin::class)]
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
                $data['audienceTarget'],
                $data['audienceGroups'],
                $data['targetAppMode'],
                $data['targetApps'],
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

    #[AuthorizedAdminSetting(settings: Admin::class)]
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

    #[AuthorizedAdminSetting(settings: Admin::class)]
    #[CSRFRequired]
    public function reorderBanners(): DataResponse {
        $payload = $this->readInput();
        $ids = $payload['ids'] ?? [];

        if (is_string($ids)) {
            $decoded = json_decode($ids, true);
            $ids = is_array($decoded) ? $decoded : [];
        }

        if (!is_array($ids)) {
            return new DataResponse(
                ['message' => 'Invalid banner order payload.'],
                Http::STATUS_BAD_REQUEST
            );
        }

        try {
            $banners = $this->configService->reorderBanners($ids);
        } catch (InvalidArgumentException $e) {
            return new DataResponse(
                ['message' => $e->getMessage()],
                Http::STATUS_BAD_REQUEST
            );
        }

        return new DataResponse($banners);
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
     * @return array{enabled: bool, message: string, messageTranslations: array<string, string>, variant: string, customBackground: string, customText: string, textAlignment: string, dismissible: bool, readMoreText: string, readMoreTextTranslations: array<string, string>, readMoreUrl: string, scheduleStart: string, scheduleEnd: string, audienceTarget: string, audienceGroups: array<int, string>, targetAppMode: string, targetApps: array<int, string>}
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
            'audienceTarget' => (string)($payload['audienceTarget'] ?? 'all'),
            'audienceGroups' => $this->normalizeStringList($payload['audienceGroups'] ?? []),
            'targetAppMode' => (string)($payload['targetAppMode'] ?? 'all'),
            'targetApps' => $this->normalizeStringList($payload['targetApps'] ?? []),
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

    /**
     * @param mixed $value
     * @return array<int, string>
     */
    private function normalizeStringList(mixed $value): array {
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                $value = $decoded;
            } else {
                $value = preg_split('/\r\n|\r|\n/', $value) ?: [];
            }
        }

        if (!is_array($value)) {
            return [];
        }

        $normalized = [];
        foreach ($value as $entry) {
            $item = trim((string)$entry);
            if ($item === '') {
                continue;
            }

            $normalized[] = $item;
        }

        return array_values(array_unique($normalized));
    }

    /**
     * @return array<int, string>
     */
    private function getViewerGroupIds(?IUser $user): array {
        if (!$user instanceof IUser) {
            return [];
        }

        $groupIds = [];
        foreach ($this->groupManager->getUserGroups($user) as $group) {
            if ($group === null) {
                continue;
            }

            $gid = trim((string)$group->getGID());
            if ($gid !== '') {
                $groupIds[] = $gid;
            }
        }

        return array_values(array_unique($groupIds));
    }

    private function isAdminUser(?IUser $user): bool {
        if (!$user instanceof IUser) {
            return false;
        }

        if (method_exists($this->groupManager, 'isAdmin')) {
            return (bool)$this->groupManager->isAdmin($user->getUID());
        }

        return in_array('admin', $this->getViewerGroupIds($user), true);
    }
}

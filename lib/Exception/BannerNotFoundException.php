<?php

declare(strict_types=1);

namespace OCA\AnnouncementBanner\Exception;

use InvalidArgumentException;

/**
 * Thrown when a banner id does not match any stored banner. Kept distinct from
 * a generic InvalidArgumentException so callers can pick the right HTTP status
 * without comparing (translatable, therefore locale-dependent) exception messages.
 */
class BannerNotFoundException extends InvalidArgumentException {
}

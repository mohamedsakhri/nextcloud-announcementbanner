<?php

declare(strict_types=1);

namespace OCA\AnnouncementBanner\Command;

use InvalidArgumentException;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;

/**
 * Shared option definitions and parsing helpers for the banner CLI commands.
 */
trait BannerOptionsTrait {
    private function addBannerOptions(Command $command): void {
        $command
            ->addOption('variant', null, InputOption::VALUE_REQUIRED, 'Colour theme: info, success, warning, danger or custom')
            ->addOption('background', null, InputOption::VALUE_REQUIRED, 'Custom background colour as a hex code (e.g. #ff8c00), used when --variant=custom')
            ->addOption('text-color', null, InputOption::VALUE_REQUIRED, 'Custom text colour as a hex code, used when --variant=custom')
            ->addOption('align', null, InputOption::VALUE_REQUIRED, 'Text alignment: left, center or right')
            ->addOption('start', null, InputOption::VALUE_REQUIRED, 'Schedule start date/time (e.g. "2026-08-26 14:00"), when the banner should appear. Pass an empty string to clear.')
            ->addOption('end', null, InputOption::VALUE_REQUIRED, 'Schedule end date/time, when the banner should disappear. Pass an empty string to clear.')
            ->addOption('link-text', null, InputOption::VALUE_REQUIRED, 'Label for the optional "read more" link')
            ->addOption('link-url', null, InputOption::VALUE_REQUIRED, 'URL for the optional "read more" link')
            ->addOption('message-translations', null, InputOption::VALUE_REQUIRED, 'JSON object mapping locale to translated message, e.g. \'{"de":"Wartungsarbeiten..."}\'')
            ->addOption('link-text-translations', null, InputOption::VALUE_REQUIRED, 'JSON object mapping locale to translated link text')
            ->addOption('audience', null, InputOption::VALUE_REQUIRED, 'Who can see the banner: all, admins or groups')
            ->addOption('groups', null, InputOption::VALUE_REQUIRED, 'Comma-separated group ids, used when --audience=groups')
            ->addOption('groups-mode', null, InputOption::VALUE_REQUIRED, 'How --groups is applied: only (restrict to) or exclude')
            ->addOption('groups-match', null, InputOption::VALUE_REQUIRED, 'How --groups is matched: any or all')
            ->addOption('apps', null, InputOption::VALUE_REQUIRED, 'Comma-separated app/settings ids to target, used with --apps-mode')
            ->addOption('apps-mode', null, InputOption::VALUE_REQUIRED, 'How --apps is applied: all (no restriction), only or exclude');
    }

    /**
     * @param string[] $allowed
     */
    private function validateChoice(string $value, array $allowed, string $optionName): void {
        if (!in_array(strtolower(trim($value)), $allowed, true)) {
            throw new InvalidArgumentException(sprintf(
                'Invalid value "%s" for --%s. Allowed values: %s.',
                $value,
                $optionName,
                implode(', ', $allowed)
            ));
        }
    }

    /**
     * Validates the shared set of choice-based banner options against
     * ConfigService's allowed values. Relies on $this->configService,
     * which every command using this trait provides via its constructor.
     */
    private function validateBannerChoices(
        string $variant,
        string $align,
        string $audience,
        string $groupsMode,
        string $groupsMatch,
        string $appsMode,
    ): void {
        $this->validateChoice($variant, $this->configService->getAllowedVariants(), 'variant');
        $this->validateChoice($align, $this->configService->getAllowedTextAlignments(), 'align');
        $this->validateChoice($audience, $this->configService->getAllowedAudienceTargets(), 'audience');
        $this->validateChoice($groupsMode, $this->configService->getAllowedAudienceGroupsModes(), 'groups-mode');
        $this->validateChoice($groupsMatch, $this->configService->getAllowedAudienceGroupsMatches(), 'groups-match');
        $this->validateChoice($appsMode, $this->configService->getAllowedTargetAppModes(), 'apps-mode');
    }

    private function validateColor(string $value, string $optionName): void {
        if ($value === '') {
            return;
        }

        if (!preg_match('/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $value)) {
            throw new InvalidArgumentException(sprintf(
                'Invalid value "%s" for --%s. Expected a hex colour code, e.g. #ff8c00.',
                $value,
                $optionName
            ));
        }
    }

    /**
     * @return array<int, string>|null null means "option not provided"
     */
    private function parseCommaList(?string $value): ?array {
        if ($value === null) {
            return null;
        }

        if (trim($value) === '') {
            return [];
        }

        $items = array_map('trim', explode(',', $value));

        return array_values(array_filter($items, static fn (string $item): bool => $item !== ''));
    }

    /**
     * @return array<string, string>|null null means "option not provided"
     */
    private function parseTranslations(InputInterface $input, string $optionName): ?array {
        $raw = $input->getOption($optionName);
        if ($raw === null) {
            return null;
        }

        if (trim($raw) === '') {
            return [];
        }

        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            throw new InvalidArgumentException(sprintf('--%s must be a valid JSON object, e.g. \'{"de":"Text"}\'.', $optionName));
        }

        $translations = [];
        foreach ($decoded as $locale => $text) {
            $translations[(string)$locale] = (string)$text;
        }

        return $translations;
    }
}

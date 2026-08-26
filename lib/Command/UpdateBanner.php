<?php

declare(strict_types=1);

namespace OCA\AnnouncementBanner\Command;

use InvalidArgumentException;
use OCA\AnnouncementBanner\Service\ConfigService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class UpdateBanner extends Command {
    use BannerOptionsTrait;

    public function __construct(
        private ConfigService $configService,
    ) {
        parent::__construct();
    }

    protected function configure(): void {
        $this
            ->setName('announcementbanner:update')
            ->setDescription('Update an existing announcement banner. Only the options you pass are changed; everything else keeps its current value.')
            ->addArgument('id', InputArgument::REQUIRED, 'The id of the banner to update')
            ->addOption('message', null, InputOption::VALUE_REQUIRED, 'The banner message text')
            ->addOption('enable', null, InputOption::VALUE_NONE, 'Make the banner active')
            ->addOption('disable', null, InputOption::VALUE_NONE, 'Make the banner inactive')
            ->addOption('dismiss', null, InputOption::VALUE_NONE, 'Enable the dismiss (close) icon')
            ->addOption('no-dismiss', null, InputOption::VALUE_NONE, 'Disable the dismiss (close) icon so the banner cannot be hidden by users');

        $this->addBannerOptions($this);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int {
        $io = new SymfonyStyle($input, $output);
        $id = (string)$input->getArgument('id');

        $banner = $this->configService->getBanner($id);
        if ($banner === null) {
            $io->error(sprintf('No banner found with id: %s', $id));
            return 1;
        }

        if ($input->getOption('enable') && $input->getOption('disable')) {
            $io->error('Cannot pass both --enable and --disable.');
            return 1;
        }

        if ($input->getOption('dismiss') && $input->getOption('no-dismiss')) {
            $io->error('Cannot pass both --dismiss and --no-dismiss.');
            return 1;
        }

        $enabled = $banner['enabled'];
        if ($input->getOption('enable')) {
            $enabled = true;
        } elseif ($input->getOption('disable')) {
            $enabled = false;
        }

        $dismissible = $banner['dismissible'];
        if ($input->getOption('dismiss')) {
            $dismissible = true;
        } elseif ($input->getOption('no-dismiss')) {
            $dismissible = false;
        }

        $variant = $input->getOption('variant') ?? $banner['variant'];
        $icon = $input->getOption('icon') ?? $banner['icon'];
        $align = $input->getOption('align') ?? $banner['textAlignment'];
        $audience = $input->getOption('audience') ?? $banner['audienceTarget'];
        $groupsMode = $input->getOption('groups-mode') ?? $banner['audienceGroupsMode'];
        $groupsMatch = $input->getOption('groups-match') ?? $banner['audienceGroupsMatch'];
        $appsMode = $input->getOption('apps-mode') ?? $banner['targetAppMode'];
        $background = (string)($input->getOption('background') ?? $banner['customBackground']);
        $textColor = (string)($input->getOption('text-color') ?? $banner['customText']);

        try {
            $this->validateBannerChoices($variant, $icon, $align, $audience, $groupsMode, $groupsMatch, $appsMode);
            $this->validateColor($background, 'background');
            $this->validateColor($textColor, 'text-color');

            $updated = $this->configService->updateBanner(
                $id,
                $enabled,
                (string)($input->getOption('message') ?? $banner['message']),
                $this->parseTranslations($input, 'message-translations') ?? $banner['messageTranslations'],
                $variant,
                $icon,
                $background,
                $textColor,
                $align,
                $dismissible,
                (string)($input->getOption('link-text') ?? $banner['readMoreText']),
                $this->parseTranslations($input, 'link-text-translations') ?? $banner['readMoreTextTranslations'],
                (string)($input->getOption('link-url') ?? $banner['readMoreUrl']),
                (string)($input->getOption('start') ?? $banner['scheduleStart']),
                (string)($input->getOption('end') ?? $banner['scheduleEnd']),
                $audience,
                $this->parseCommaList($input->getOption('groups')) ?? $banner['audienceGroups'],
                $groupsMode,
                $groupsMatch,
                $appsMode,
                $this->parseCommaList($input->getOption('apps')) ?? $banner['targetApps'],
            );
        } catch (InvalidArgumentException $e) {
            $io->error($e->getMessage());
            return 1;
        }

        $io->success(sprintf('Banner %s updated.', $id));
        $io->definitionList(
            ['Status' => $updated['status']],
            ['Variant' => $updated['variant']],
            ['Message' => $updated['message']],
        );

        return 0;
    }
}

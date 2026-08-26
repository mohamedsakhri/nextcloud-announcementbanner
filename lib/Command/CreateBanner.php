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

class CreateBanner extends Command {
    use BannerOptionsTrait;

    public function __construct(
        private ConfigService $configService,
    ) {
        parent::__construct();
    }

    protected function configure(): void {
        $this
            ->setName('announcementbanner:create')
            ->setDescription('Create a new announcement banner')
            ->addArgument('message', InputArgument::REQUIRED, 'The banner message text')
            ->addOption('disabled', null, InputOption::VALUE_NONE, 'Create the banner disabled instead of immediately active')
            ->addOption('no-dismiss', null, InputOption::VALUE_NONE, 'Disable the dismiss (close) icon so the banner cannot be hidden by users');

        $this->addBannerOptions($this);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int {
        $io = new SymfonyStyle($input, $output);

        $variant = $input->getOption('variant') ?? 'info';
        $icon = $input->getOption('icon') ?? 'megaphone';
        $align = $input->getOption('align') ?? 'left';
        $audience = $input->getOption('audience') ?? 'all';
        $groupsMode = $input->getOption('groups-mode') ?? 'only';
        $groupsMatch = $input->getOption('groups-match') ?? 'any';
        $appsMode = $input->getOption('apps-mode') ?? 'all';
        $background = (string)($input->getOption('background') ?? '');
        $textColor = (string)($input->getOption('text-color') ?? '');

        try {
            $this->validateBannerChoices($variant, $icon, $align, $audience, $groupsMode, $groupsMatch, $appsMode);
            $this->validateColor($background, 'background');
            $this->validateColor($textColor, 'text-color');

            $banner = $this->configService->createBanner(
                !$input->getOption('disabled'),
                (string)$input->getArgument('message'),
                $this->parseTranslations($input, 'message-translations') ?? [],
                $variant,
                $icon,
                $background,
                $textColor,
                $align,
                !$input->getOption('no-dismiss'),
                (string)($input->getOption('link-text') ?? ''),
                $this->parseTranslations($input, 'link-text-translations') ?? [],
                (string)($input->getOption('link-url') ?? ''),
                (string)($input->getOption('start') ?? ''),
                (string)($input->getOption('end') ?? ''),
                $audience,
                $this->parseCommaList($input->getOption('groups')) ?? [],
                $groupsMode,
                $groupsMatch,
                $appsMode,
                $this->parseCommaList($input->getOption('apps')) ?? [],
            );
        } catch (InvalidArgumentException $e) {
            $io->error($e->getMessage());
            return 1;
        }

        $io->success(sprintf('Banner created with id: %s', $banner['id']));
        $io->definitionList(
            ['Status' => $banner['status']],
            ['Variant' => $banner['variant']],
            ['Message' => $banner['message']],
        );

        return 0;
    }
}

<?php

declare(strict_types=1);

namespace OCA\AnnouncementBanner\Command;

use OCA\AnnouncementBanner\Service\ConfigService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ListBanners extends Command {
    public function __construct(
        private ConfigService $configService,
    ) {
        parent::__construct();
    }

    protected function configure(): void {
        $this
            ->setName('announcementbanner:list')
            ->setDescription('List all announcement banners')
            ->addOption('output', null, InputOption::VALUE_REQUIRED, 'Output format: table or json', 'table');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int {
        $banners = $this->configService->getBannersForAdmin();

        if ($input->getOption('output') === 'json') {
            $output->writeln((string)json_encode($banners, JSON_PRETTY_PRINT));
            return 0;
        }

        if ($banners === []) {
            $output->writeln('No banners configured.');
            return 0;
        }

        $table = new Table($output);
        $table->setHeaders(['Id', 'Status', 'Variant', 'Message', 'Start', 'End', 'Dismissible', 'Link']);

        foreach ($banners as $banner) {
            $table->addRow([
                $banner['id'],
                $banner['status'],
                $banner['variant'],
                $this->truncate((string)$banner['message']),
                $banner['scheduleStart'] ?: '-',
                $banner['scheduleEnd'] ?: '-',
                $banner['dismissible'] ? 'yes' : 'no',
                $banner['readMoreUrl'] ?: '-',
            ]);
        }

        $table->render();

        return 0;
    }

    private function truncate(string $value, int $length = 60): string {
        if (mb_strlen($value) <= $length) {
            return $value;
        }

        return mb_substr($value, 0, $length - 1) . '…';
    }
}

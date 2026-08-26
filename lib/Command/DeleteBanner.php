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
use Symfony\Component\Console\Question\ConfirmationQuestion;
use Symfony\Component\Console\Style\SymfonyStyle;

class DeleteBanner extends Command {
    public function __construct(
        private ConfigService $configService,
    ) {
        parent::__construct();
    }

    protected function configure(): void {
        $this
            ->setName('announcementbanner:delete')
            ->setDescription('Delete an announcement banner')
            ->addArgument('id', InputArgument::REQUIRED, 'The id of the banner to delete')
            ->addOption('force', 'f', InputOption::VALUE_NONE, 'Do not ask for confirmation');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int {
        $io = new SymfonyStyle($input, $output);
        $id = (string)$input->getArgument('id');

        $banner = $this->configService->getBanner($id);
        if ($banner === null) {
            $io->error(sprintf('No banner found with id: %s', $id));
            return 1;
        }

        if (!$input->getOption('force') && $input->isInteractive()) {
            $question = new ConfirmationQuestion(
                sprintf('Delete banner "%s" (%s)? [y/N] ', $banner['message'], $id),
                false
            );
            if (!$this->getHelper('question')->ask($input, $output, $question)) {
                $io->comment('Aborted.');
                return 1;
            }
        }

        try {
            $this->configService->deleteBanner($id);
        } catch (InvalidArgumentException $e) {
            $io->error($e->getMessage());
            return 1;
        }

        $io->success(sprintf('Banner %s deleted.', $id));

        return 0;
    }
}

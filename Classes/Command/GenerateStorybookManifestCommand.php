<?php
declare(strict_types=1);

namespace MyVendor\MyFluidStorybook\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\PathUtility;

class GenerateStorybookManifestCommand extends Command
{
    // Extension key to scan. For this basic implementation, it's hardcoded.
    private const TARGET_EXTENSION_KEY = 'my_fluid_storybook';

    public function __construct(
        private readonly PackageManager $packageManager
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setHelp('Scans the "' . self::TARGET_EXTENSION_KEY . '" extension for Fluid templates, partials, and layouts and generates a JSON manifest file in Resources/Public/Storybook/template-manifest.json');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Generating Storybook Fluid Template Manifest');

        if (!$this->packageManager->isPackageActive(self::TARGET_EXTENSION_KEY)) {
            $io->error('The target extension "' . self::TARGET_EXTENSION_KEY . '" is not active. Manifest generation aborted.');
            return Command::FAILURE;
        }

        $packagePath = $this->packageManager->getPackage(self::TARGET_EXTENSION_KEY)->getPackagePath();

        $manifest = [
            'templates' => [],
            'partials' => [],
            'layouts' => [],
        ];

        $scanPaths = [
            'templates' => 'Resources/Private/Templates/',
            'partials' => 'Resources/Private/Partials/',
            'layouts' => 'Resources/Private/Layouts/',
        ];

        foreach ($scanPaths as $type => $relativePath) {
            $fullDirectoryPath = PathUtility::sanitizeTrailingSeparator($packagePath) . $relativePath;
            if (!is_dir($fullDirectoryPath)) {
                $io->writeln(sprintf('Directory for %s not found: %s (Skipping)', $type, $fullDirectoryPath));
                continue;
            }

            $files = GeneralUtility::getFilesInDir($fullDirectoryPath, 'html', true); // Get .html files, full path

            foreach ($files as $filePath) {
                $fileName = basename($filePath);
                $fileNameWithoutExtension = pathinfo($fileName, PATHINFO_FILENAME);
                $extPath = 'EXT:' . self::TARGET_EXTENSION_KEY . '/' . $relativePath . $fileName;

                $manifest[$type][] = [
                    'path' => $extPath,
                    'type' => ucfirst($type), // Template, Partial, Layout
                    'extension' => self::TARGET_EXTENSION_KEY,
                    'name' => $fileNameWithoutExtension,
                ];
                $io->writeln(sprintf('Found %s: %s', ucfirst($type), $extPath));
            }
        }

        $manifestPath = PathUtility::sanitizeTrailingSeparator($packagePath) . 'Resources/Public/Storybook/template-manifest.json';
        $manifestDir = dirname($manifestPath);

        if (!is_dir($manifestDir)) {
            GeneralUtility::mkdir_deep($manifestDir);
        }

        $jsonContent = json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        if (GeneralUtility::writeFile($manifestPath, $jsonContent)) {
            $io->success('Successfully generated template manifest: ' . $manifestPath);
            return Command::SUCCESS;
        } else {
            $io->error('Failed to write template manifest to: ' . $manifestPath);
            return Command::FAILURE;
        }
    }
}

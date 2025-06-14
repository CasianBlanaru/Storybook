<?php
declare(strict_types=1);

namespace MyVendor\MyFluidStorybook\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Package\PackageInterface;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\PathUtility;

class GenerateStorybookManifestCommand extends Command
{
    private const OPTION_EXTENSION_KEYS = 'extension-keys';
    private const SELF_EXTENSION_KEY = 'my_fluid_storybook'; // Key of this extension

    // System/core extensions to exclude from 'scan all' mode
    private const SYSTEM_EXTENSION_PREFIXES = [
        'core', 'sys_', 'be_', 'fe_', 'extbase', 'fluid', 'install', 'recordlist',
        'info', 'scheduler', 'impexp', 'lowlevel', 'reports', 'setup', 'workspaces',
        'version', 'backend', 'frontend', 'documentation', 'tstemplate', 'filelist',
        'about', 'extensionmanager', 't3editor', 'adminpanel', 'belog', 'beuser',
        'felogin', 'form', 'linkvalidator', 'redirects', 'seo', 'sys_note',
        'typo3db_legacy', 'viewpage', 'webpagetitle_tsफेvider', // common system/global extensions
    ];
    private const EXCLUDE_EXACT_KEYS = [ // Exact keys to exclude
        self::SELF_EXTENSION_KEY, // Exclude this extension itself from "scan all"
        'typo3_console', // The console itself
        // Add other specific keys if needed
    ];


    public function __construct(
        private readonly PackageManager $packageManager
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setHelp(
            'Scans specified TYPO3 extensions (or all active non-system extensions by default) ' .
            'for Fluid templates, partials, and layouts, then generates a JSON manifest file ' .
            'in ' . self::SELF_EXTENSION_KEY . '/Resources/Public/Storybook/template-manifest.json'
        );
        $this->addArgument(
            self::OPTION_EXTENSION_KEYS,
            InputArgument::IS_ARRAY | InputArgument::OPTIONAL,
            'Space-separated list of extension keys to scan (e.g., my_sitepackage my_other_ext). If omitted, scans all active non-system extensions.'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Generating Storybook Fluid Template Manifest');

        $extensionKeysToScan = $input->getArgument(self::OPTION_EXTENSION_KEYS);
        $specificExtensionsProvided = !empty($extensionKeysToScan);

        if (!$specificExtensionsProvided) {
            $io->writeln('No specific extension keys provided. Scanning all active non-system extensions...');
            $allActivePackages = $this->packageManager->getActivePackages();
            $extensionKeysToScan = [];
            foreach ($allActivePackages as $package) {
                $extKey = $package->getPackageKey();
                if ($this->shouldScanExtension($extKey)) {
                    $extensionKeysToScan[] = $extKey;
                } else {
                    $io->writeln(sprintf('Skipping system/excluded extension: %s', $extKey), OutputInterface::VERBOSITY_VERBOSE);
                }
            }
            if (empty($extensionKeysToScan)) {
                $io->warning('No suitable extensions found to scan in "scan all" mode.');
                // Still proceed to write an empty manifest
            }
        } else {
            $io->writeln('Scanning specified extensions: ' . implode(', ', $extensionKeysToScan));
        }

        $manifest = [
            'templates' => [],
            'partials' => [],
            'layouts' => [],
        ];

        $scanPathsDefinition = [
            'templates' => 'Resources/Private/Templates/',
            'partials' => 'Resources/Private/Partials/',
            'layouts' => 'Resources/Private/Layouts/',
        ];

        foreach ($extensionKeysToScan as $extKey) {
            if (!$this->packageManager->isPackageActive($extKey)) {
                $io->warning(sprintf('Specified extension "%s" is not active or does not exist. Skipping.', $extKey));
                continue;
            }
            $io->section(sprintf('Scanning extension: %s', $extKey));
            $package = $this->packageManager->getPackage($extKey);
            $packagePath = $package->getPackagePath();

            foreach ($scanPathsDefinition as $typeKey => $relativePath) {
                $fullDirectoryPath = PathUtility::sanitizeTrailingSeparator($packagePath) . $relativePath;
                if (!is_dir($fullDirectoryPath)) {
                    $io->writeln(sprintf('Directory for %s not found: %s (Skipping)', $typeKey, $fullDirectoryPath), OutputInterface::VERBOSITY_VERBOSE);
                    continue;
                }

                $files = GeneralUtility::getFilesInDir($fullDirectoryPath, 'html', true);

                foreach ($files as $filePath) {
                    $fileName = basename($filePath);
                    $fileNameWithoutExtension = pathinfo($fileName, PATHINFO_FILENAME);
                    // Ensure relative path within Resources/Private/... is used for EXT: path
                    $extSpecificPath = $relativePath . $fileName;
                    $extPath = 'EXT:' . $extKey . '/' . $extSpecificPath;

                    $manifest[$typeKey][] = [
                        'path' => $extPath,
                        'type' => ucfirst($typeKey),
                        'extension' => $extKey,
                        'name' => $fileNameWithoutExtension,
                    ];
                    $io->writeln(sprintf('Found %s: %s', ucfirst($typeKey), $extPath), OutputInterface::VERBOSITY_VERY_VERBOSE);
                }
            }
        }

        // Determine path to THIS extension (my_fluid_storybook) to save the manifest
        $thisExtensionPackage = $this->packageManager->getPackage(self::SELF_EXTENSION_KEY);
        if (!$thisExtensionPackage) {
             $io->error('Could not locate the main "' . self::SELF_EXTENSION_KEY . '" package to save the manifest. This should not happen.');
             return Command::FAILURE;
        }
        $thisExtensionPath = $thisExtensionPackage->getPackagePath();
        $manifestPath = PathUtility::sanitizeTrailingSeparator($thisExtensionPath) . 'Resources/Public/Storybook/template-manifest.json';
        $manifestDir = dirname($manifestPath);

        if (!is_dir($manifestDir)) {
            GeneralUtility::mkdir_deep($manifestDir);
        }

        $jsonContent = json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        if (GeneralUtility::writeFile($manifestPath, $jsonContent)) {
            $io->success('Successfully generated template manifest: ' . $manifestPath);
            $io->writeln(sprintf('Found %d templates, %d partials, %d layouts.', count($manifest['templates']), count($manifest['partials']), count($manifest['layouts'])));
            return Command::SUCCESS;
        } else {
            $io->error('Failed to write template manifest to: ' . $manifestPath);
            return Command::FAILURE;
        }
    }

    private function shouldScanExtension(string $extKey): bool
    {
        if (in_array($extKey, self::EXCLUDE_EXACT_KEYS, true)) {
            return false;
        }
        foreach (self::SYSTEM_EXTENSION_PREFIXES as $prefix) {
            if (str_starts_with($extKey, $prefix)) {
                return false;
            }
        }
        return true;
    }
}

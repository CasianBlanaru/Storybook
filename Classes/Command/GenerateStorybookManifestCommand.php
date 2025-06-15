<?php
declare(strict_types=1);

namespace MyVendor\MyFluidStorybook\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\PathUtility;

/**
 * Symfony Command to generate a JSON manifest of Fluid templates, partials, and layouts.
 *
 * The command can scan specified TYPO3 extensions or, by default, all active
 * non-system extensions. The manifest is saved within this extension's
 * Resources/Public/Storybook/ directory and is intended for use by Storybook UI components.
 */
class GenerateStorybookManifestCommand extends Command
{
    /**
     * @var string Name of the command argument for specifying extension keys.
     */
    private const OPTION_EXTENSION_KEYS = 'extension-keys';

    /**
     * @var string Extension key of this extension, used to locate where to save the manifest.
     */
    private const SELF_EXTENSION_KEY = 'my_fluid_storybook';

    /**
     * @var list<string> Prefixes of system/core TYPO3 extensions to exclude from 'scan all' mode.
     */
    private const SYSTEM_EXTENSION_PREFIXES = [
        'core', 'sys_', 'be_', 'fe_', 'extbase', 'fluid', 'install', 'recordlist',
        'info', 'scheduler', 'impexp', 'lowlevel', 'reports', 'setup', 'workspaces',
        'version', 'backend', 'frontend', 'documentation', 'tstemplate', 'filelist',
        'about', 'extensionmanager', 't3editor', 'adminpanel', 'belog', 'beuser',
        'felogin', 'form', 'linkvalidator', 'redirects', 'seo', 'sys_note',
        'typo3db_legacy', 'viewpage', // 'webpagetitle_provider' had a typo, assuming it's not a standard prefix
    ];

    /**
     * @var list<string> Exact extension keys to always exclude from 'scan all' mode.
     */
    private const EXCLUDE_EXACT_KEYS = [
        self::SELF_EXTENSION_KEY, // Exclude this extension itself from "scan all" by default
        'typo3_console',      // The console extension itself
        // Add other specific keys if needed, e.g., 'gridelements', 'container'
    ];

    /**
     * @var PackageManager Used to interact with TYPO3's package system.
     */
    private readonly PackageManager $packageManager;

    /**
     * Constructor. Injects PackageManager.
     * @param PackageManager $packageManager
     */
    public function __construct(PackageManager $packageManager)
    {
        parent::__construct();
        $this->packageManager = $packageManager;
    }

    /**
     * Configures the command, setting help text and arguments.
     */
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

    /**
     * Executes the command to generate the template manifest.
     *
     * @param InputInterface $input Command input.
     * @param OutputInterface $output Command output.
     * @return int Command exit code (SUCCESS or FAILURE).
     */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Generating Storybook Fluid Template Manifest');

        /** @var list<string> $extensionKeysToScan */
        $extensionKeysToScan = $input->getArgument(self::OPTION_EXTENSION_KEYS) ?: [];
        $specificExtensionsProvided = !empty($extensionKeysToScan);

        if (!$specificExtensionsProvided) {
            $io->writeln('No specific extension keys provided. Scanning all active non-system extensions...');
            $allActivePackages = $this->packageManager->getActivePackages();
            $extensionKeysToScan = []; // Reset to populate with filtered list
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

                $files = GeneralUtility::getFilesInDir($fullDirectoryPath, 'html', true); // Get .html files, full path

                foreach ($files as $filePath) {
                    $fileName = basename($filePath);
                    $fileNameWithoutExtension = pathinfo($fileName, PATHINFO_FILENAME);

                    if (empty($fileNameWithoutExtension)) {
                        $io->writeln(sprintf('Skipping file with empty base name: %s', $filePath), OutputInterface::VERBOSITY_VERBOSE);
                        continue; // Skip this file
                    }

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
        if ($jsonContent === false) {
            $io->error('Failed to encode manifest data to JSON. Error: ' . json_last_error_msg());
            return Command::FAILURE;
        }

        if (GeneralUtility::writeFile($manifestPath, $jsonContent)) {
            $io->success('Successfully generated template manifest: ' . $manifestPath);
            $io->writeln(sprintf('Found %d templates, %d partials, %d layouts.', count($manifest['templates']), count($manifest['partials']), count($manifest['layouts'])));
            return Command::SUCCESS;
        } else {
            $io->error('Failed to write template manifest to: ' . $manifestPath);
            return Command::FAILURE;
        }
    }

    /**
     * Determines if a given extension key should be scanned in "scan all" mode.
     * Excludes system extensions and explicitly defined keys.
     *
     * @param string $extKey The extension key to check.
     * @return bool True if the extension should be scanned, false otherwise.
     */
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

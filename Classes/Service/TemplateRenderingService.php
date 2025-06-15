<?php
declare(strict_types=1);

namespace MyVendor\MyFluidStorybook\Service;

use Psr\Log\LoggerInterface;
use TYPO3\CMS\Core\Log\LogManager;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\View\StandaloneView;

/**
 * Service for rendering Fluid templates with enhanced error handling and monitoring.
 */
class TemplateRenderingService
{
    private LoggerInterface $logger;

    public function __construct()
    {
        $this->logger = GeneralUtility::makeInstance(LogManager::class)->getLogger(__CLASS__);
    }

    /**
     * Renders a Fluid template with comprehensive error handling.
     * 
     * @param string $templatePath
     * @param array<string, mixed> $variables
     * @return array{success: bool, content?: string, error?: string, metrics?: array}
     */
    public function renderTemplate(string $templatePath, array $variables = []): array
    {
        $startTime = microtime(true);
        
        try {
            // Validate template path
            if (!$this->isValidTemplatePath($templatePath)) {
                $this->logger->warning('Invalid template path attempted', ['path' => $templatePath]);
                return ['success' => false, 'error' => 'Invalid template path'];
            }

            $absoluteTemplatePath = GeneralUtility::getFileAbsFileName($templatePath);
            
            if (!file_exists($absoluteTemplatePath) || !is_readable($absoluteTemplatePath)) {
                $this->logger->error('Template file not accessible', [
                    'path' => $templatePath,
                    'absolutePath' => $absoluteTemplatePath
                ]);
                return ['success' => false, 'error' => 'Template file not found or not readable'];
            }

            $standaloneView = GeneralUtility::makeInstance(StandaloneView::class);
            $standaloneView->setTemplatePathAndFilename($absoluteTemplatePath);
            $standaloneView->assignMultiple($variables);

            $renderedContent = $standaloneView->render();
            $renderTime = microtime(true) - $startTime;

            $this->logger->info('Template rendered successfully', [
                'path' => $templatePath,
                'renderTime' => $renderTime,
                'contentLength' => strlen($renderedContent)
            ]);

            return [
                'success' => true,
                'content' => $renderedContent,
                'metrics' => [
                    'renderTime' => $renderTime,
                    'contentLength' => strlen($renderedContent),
                    'variableCount' => count($variables)
                ]
            ];

        } catch (\Throwable $e) {
            $renderTime = microtime(true) - $startTime;
            
            $this->logger->error('Template rendering failed', [
                'path' => $templatePath,
                'error' => $e->getMessage(),
                'renderTime' => $renderTime,
                'exception' => $e
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'metrics' => ['renderTime' => $renderTime]
            ];
        }
    }

    /**
     * Validates if a template path is secure and properly formatted.
     */
    private function isValidTemplatePath(string $templatePath): bool
    {
        return str_starts_with($templatePath, 'EXT:') 
            && !str_contains($templatePath, '..')
            && !str_contains($templatePath, '//');
    }
} 
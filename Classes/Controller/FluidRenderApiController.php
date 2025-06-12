<?php
declare(strict_types=1);

namespace MyVendor\MyFluidStorybook\Controller;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Cache\CacheManager;
use TYPO3\CMS\Core\Cache\Frontend\VariableFrontend;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Http\Response;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController; // Still using ActionController for simplicity of setup
use TYPO3\CMS\Fluid\View\StandaloneView;

class FluidRenderApiController extends ActionController
{
    protected const CACHE_IDENTIFIER_PREFIX = 'fluid_storybook_render_';
    // TODO: Make caching configurable via extension settings (enabled, lifetime)
    protected bool $enableCache = true; // Basic toggle for now
    protected int $cacheLifetime = 3600; // 1 hour default

    protected VariableFrontend $renderCache;

    public function __construct() // Removed CacheManager from constructor
    {
        // Cache name should be registered in ext_localconf.php or ext_tables.php
        $cacheManager = GeneralUtility::makeInstance(CacheManager::class);
        $this->renderCache = $cacheManager->getCache('myfluidstorybook_renderresults');
    }

    public function renderAction(ServerRequestInterface $request): ResponseInterface
    {
        $queryParams = $request->getQueryParams();
        $templatePath = $queryParams['templatePath'] ?? null;
        $variablesJson = $queryParams['variables'] ?? '{}';

        if ($templatePath === null) {
            return new JsonResponse(['error' => 'Parameter "templatePath" is missing.'], 400);
        }
        if (!str_starts_with($templatePath, 'EXT:') || str_contains($templatePath, '..')) {
            return new JsonResponse(['error' => 'Invalid "templatePath". Must start with EXT: and not contain ".."'], 400);
        }

        $variablesArray = json_decode($variablesJson, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new JsonResponse(['error' => 'Invalid JSON in "variables" parameter.'], 400);
        }
        $variables = $variablesArray ?? []; // Ensure it's an array

        // Generate Cache Identifier
        $cacheIdentifier = self::CACHE_IDENTIFIER_PREFIX . hash('sha256', $templatePath . ':' . hash('sha256', $variablesJson));

        // Attempt to fetch from cache
        if ($this->enableCache && $this->renderCache->has($cacheIdentifier)) {
            $cachedContent = $this->renderCache->get($cacheIdentifier);
            if (is_string($cachedContent)) {
                $response = new Response();
                $response->getBody()->write($cachedContent);
                // Add a header to indicate cache hit for debugging
                return $response->withHeader('Content-Type', 'text/html; charset=utf-f8') // Corrected charset
                                 ->withHeader('X-FluidStorybook-Cache', 'hit');
            }
        }

        try {
            $standaloneView = GeneralUtility::makeInstance(StandaloneView::class);
            $absoluteTemplatePath = GeneralUtility::getFileAbsFileName($templatePath);

            if (!file_exists($absoluteTemplatePath) || !is_readable($absoluteTemplatePath)) {
                return new JsonResponse(['error' => 'Template file not found or not readable at: ' . $templatePath], 404);
            }

            $standaloneView->setTemplatePathAndFilename($absoluteTemplatePath);
            $standaloneView->assignMultiple($variables);

            $renderedContent = $standaloneView->render();

            // Store in cache
            if ($this->enableCache) {
                $this->renderCache->set($cacheIdentifier, $renderedContent, [], $this->cacheLifetime);
            }

            $response = new Response();
            $response->getBody()->write($renderedContent);
            return $response->withHeader('Content-Type', 'text/html; charset=utf-8')
                             ->withHeader('X-FluidStorybook-Cache', 'miss'); // Debug header

        } catch (\Exception $e) {
            // Log the exception internally if possible
            return new JsonResponse(['error' => 'Failed to render Fluid template.', 'details' => $e->getMessage()], 500);
        }
    }
}

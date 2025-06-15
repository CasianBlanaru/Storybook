<?php
declare(strict_types=1);

namespace Vendor\FluidStorybook\Controller;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Cache\CacheManager;
use TYPO3\CMS\Core\Cache\Frontend\VariableFrontend;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Http\Response;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;
use TYPO3\CMS\Fluid\View\StandaloneView;
use Vendor\FluidStorybook\Configuration\ExtensionConfiguration;

/**
 * API Controller for rendering Fluid templates.
 *
 * This controller provides an endpoint to render arbitrary Fluid templates
 * with provided variables, primarily for use with Storybook integration.
 * It includes basic caching functionality.
 */
class FluidRenderApiController extends ActionController
{
    /**
     * Prefix for cache identifiers used by this controller.
     */
    protected const CACHE_IDENTIFIER_PREFIX = 'fluid_storybook_render_';

    /**
     * @var bool Enables or disables caching for rendered templates.
     */
    protected bool $enableCache = true;

    /**
     * @var int Cache lifetime in seconds for rendered templates.
     */
    protected int $cacheLifetime;

    /**
     * @var VariableFrontend The cache frontend instance for storing render results.
     */
    protected VariableFrontend $renderCache;

    /**
     * Constructor.
     * Initializes the cache frontend and configuration.
     */
    public function __construct()
    {
        $cacheManager = GeneralUtility::makeInstance(CacheManager::class);
        $cacheIdentifier = ExtensionConfiguration::get('cache_identifier');
        $this->renderCache = $cacheManager->getCache($cacheIdentifier);
        $this->cacheLifetime = ExtensionConfiguration::getCacheLifetime();
    }

    /**
     * Renders a Fluid template based on request parameters.
     * Handles template path validation, variable assignment, rendering, and caching.
     *
     * Expected query parameters:
     * - `templatePath` (string, required): The `EXT:...` path to the Fluid template.
     * - `variables` (string, optional): A JSON string of variables to assign to the template.
     *
     * @param ServerRequestInterface $request The server request.
     * @return ResponseInterface The HTTP response, either HTML content of the rendered template or a JSON error.
     */
    public function renderAction(ServerRequestInterface $request): ResponseInterface
    {
        $queryParams = $request->getQueryParams();
        $templatePath = $queryParams['templatePath'] ?? null;
        $variablesJson = $queryParams['variables'] ?? '{}';

        if ($templatePath === null) {
            return new JsonResponse(['error' => 'Parameter "templatePath" is missing.'], 400);
        }
        if (!is_string($templatePath) || !str_starts_with($templatePath, 'EXT:') || str_contains($templatePath, '..')) {
            return new JsonResponse(['error' => 'Invalid "templatePath". Must be a string, start with EXT:, and not contain ".."'], 400);
        }

        /** @var array<string, mixed> $variables */
        $variables = json_decode($variablesJson, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new JsonResponse(['error' => 'Invalid JSON in "variables" parameter. Error: ' . json_last_error_msg()], 400);
        }
        // $variables is already an array due to true in json_decode, or null if error, handled above.

        $cacheIdentifier = self::CACHE_IDENTIFIER_PREFIX . hash('sha256', $templatePath . ':' . hash('sha256', $variablesJson));

        if ($this->enableCache && $this->renderCache->has($cacheIdentifier)) {
            $cachedContent = $this->renderCache->get($cacheIdentifier);
            if (is_string($cachedContent)) {
                $response = new Response();
                $response->getBody()->write($cachedContent);
                return $response->withHeader('Content-Type', 'text/html; charset=utf-8')
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

            if ($this->enableCache) {
                $this->renderCache->set($cacheIdentifier, $renderedContent, [], $this->cacheLifetime);
            }

            $response = new Response();
            $response->getBody()->write($renderedContent);
            return $response->withHeader('Content-Type', 'text/html; charset=utf-8')
                             ->withHeader('X-FluidStorybook-Cache', 'miss');

        } catch (\Throwable $e) { // Catching Throwable for broader error handling
            // Log the exception internally if possible using TYPO3's Logger
            GeneralUtility::makeInstance(\TYPO3\CMS\Core\Log\LogManager::class)
                ->getLogger(__CLASS__)
                ->error('Fluid rendering failed: ' . $e->getMessage(), ['exception' => $e]);

            return new JsonResponse(['error' => 'Failed to render Fluid template.', 'details' => $e->getMessage()], 500);
        }
    }
}

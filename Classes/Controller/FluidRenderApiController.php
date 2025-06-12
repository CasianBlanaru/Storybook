<?php
declare(strict_types=1);

namespace MyVendor\MyFluidStorybook\Controller;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Http\Response;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;
use TYPO3\CMS\Fluid\View\StandaloneView;

class FluidRenderApiController extends ActionController
{
    public function renderAction(ServerRequestInterface $request): ResponseInterface
    {
        $queryParams = $request->getQueryParams();
        $templatePath = $queryParams['templatePath'] ?? null;
        $variablesJson = $queryParams['variables'] ?? '{}';

        if ($templatePath === null) {
            return new JsonResponse(['error' => 'Parameter "templatePath" is missing.'], 400);
        }

        // Security: Basic path validation (can be expanded)
        // Ensure it starts with EXT: and does not contain '..'
        if (!str_starts_with($templatePath, 'EXT:') || str_contains($templatePath, '..')) {
            return new JsonResponse(['error' => 'Invalid "templatePath". Must start with EXT: and not contain ".."'], 400);
        }

        $variables = json_decode($variablesJson, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new JsonResponse(['error' => 'Invalid JSON in "variables" parameter.'], 400);
        }

        try {
            $standaloneView = GeneralUtility::makeInstance(StandaloneView::class);

            // The template path is expected in the format EXT:my_ext/Resources/Private/Templates/MyTemplate.html
            // StandaloneView needs a different format, typically 'EXT:my_ext/Resources/Private/Templates/' for templateRootPaths
            // and 'MyTemplate' for setTemplate. Or directly setTemplatePathAndFilename.

            // Let's try to make it flexible. If it's a full path to a file:
            $absoluteTemplatePath = GeneralUtility::getFileAbsFileName($templatePath);

            if (!file_exists($absoluteTemplatePath) || !is_readable($absoluteTemplatePath)) {
                return new JsonResponse(['error' => 'Template file not found or not readable at: ' . $templatePath], 404);
            }

            // To use setTemplatePathAndFilename, TYPO3 Fluid expects the path to end with .html
            // It will then look for .typoscript, .php, .html in that order.
            // Let's ensure we are robust.
            $standaloneView->setTemplatePathAndFilename($absoluteTemplatePath);

            $standaloneView->assignMultiple($variables ?? []);

            $renderedContent = $standaloneView->render();

            $response = new Response();
            $response->getBody()->write($renderedContent);
            return $response->withHeader('Content-Type', 'text/html; charset=utf-f8');

        } catch (\Exception $e) {
            // Log the exception internally if possible
            return new JsonResponse(['error' => 'Failed to render Fluid template.', 'details' => $e->getMessage()], 500);
        }
    }
}

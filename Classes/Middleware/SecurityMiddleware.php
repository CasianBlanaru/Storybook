<?php
declare(strict_types=1);

namespace Vendor\FluidStorybook\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use TYPO3\CMS\Core\Http\JsonResponse;
use Vendor\FluidStorybook\Configuration\ExtensionConfiguration;

/**
 * Security middleware for Fluid Storybook API endpoints.
 * Implements rate limiting, CORS handling, and basic security checks.
 */
class SecurityMiddleware implements MiddlewareInterface
{
    private static array $requestCounts = [];
    
    private int $rateLimitRequests;
    private int $rateLimitWindow;
    private array $allowedOrigins;
    
    public function __construct()
    {
        $this->rateLimitRequests = (int)ExtensionConfiguration::get('rate_limit_max_requests');
        $this->rateLimitWindow = (int)ExtensionConfiguration::get('rate_limit_window_minutes') * 60; // Convert to seconds
        $this->allowedOrigins = ExtensionConfiguration::getCorsAllowedOrigins();
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        // Apply only to our API endpoints
        if (!str_contains($request->getUri()->getPath(), '/api/fluid/')) {
            return $handler->handle($request);
        }

        // Rate limiting
        if (!$this->checkRateLimit($request)) {
            return new JsonResponse(['error' => 'Rate limit exceeded'], 429);
        }

        // CORS handling
        $response = $handler->handle($request);
        
        return $response
            ->withHeader('Access-Control-Allow-Origin', $this->getAllowedOrigin($request))
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
            ->withHeader('X-Content-Type-Options', 'nosniff')
            ->withHeader('X-Frame-Options', 'DENY')
            ->withHeader('X-XSS-Protection', '1; mode=block');
    }

    private function checkRateLimit(ServerRequestInterface $request): bool
    {
        $clientIp = $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown';
        $now = time();
        $windowStart = $now - $this->rateLimitWindow;

        // Clean old entries
        self::$requestCounts[$clientIp] = array_filter(
            self::$requestCounts[$clientIp] ?? [],
            fn($timestamp) => $timestamp > $windowStart
        );

        // Check current count
        if (count(self::$requestCounts[$clientIp] ?? []) >= $this->rateLimitRequests) {
            return false;
        }

        // Record this request
        self::$requestCounts[$clientIp][] = $now;
        return true;
    }

    private function getAllowedOrigin(ServerRequestInterface $request): string
    {
        $origin = $request->getHeaderLine('Origin');
        
        // Allow localhost for development
        if (str_contains($origin, 'localhost') || str_contains($origin, '127.0.0.1')) {
            return $origin;
        }
        
        // Allow .ddev.site domains for DDEV development
        if (str_contains($origin, '.ddev.site')) {
            return $origin;
        }
        
        // Check configured allowed origins
        return in_array($origin, $this->allowedOrigins) ? $origin : '';
    }
} 
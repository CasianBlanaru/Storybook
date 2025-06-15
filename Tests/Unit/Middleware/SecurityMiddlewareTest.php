<?php

declare(strict_types=1);

namespace Vendor\FluidStorybook\Tests\Unit\Middleware;

use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Http\Uri;
use Vendor\FluidStorybook\Middleware\SecurityMiddleware;

/**
 * Test case for SecurityMiddleware
 */
class SecurityMiddlewareTest extends TestCase
{
    private SecurityMiddleware $middleware;
    private RequestHandlerInterface $handler;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Set up test environment variables
        $_ENV['FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS'] = '5'; // Low limit for testing
        $_ENV['FLUID_STORYBOOK_RATE_LIMIT_WINDOW_MINUTES'] = '1'; // 1 minute window
        $_ENV['FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS'] = 'https://storybook.example.com,https://preview.example.com';
        
        $this->middleware = new SecurityMiddleware();
        
        // Mock request handler
        $this->handler = $this->createMock(RequestHandlerInterface::class);
        $this->handler->method('handle')->willReturn(new JsonResponse(['success' => true]));
    }

    protected function tearDown(): void
    {
        // Clean up environment variables
        foreach ($_ENV as $key => $value) {
            if (str_starts_with($key, 'FLUID_STORYBOOK_')) {
                unset($_ENV[$key]);
            }
        }
        parent::tearDown();
    }

    /**
     * @test
     */
    public function nonApiRequestPassesThrough(): void
    {
        $request = new ServerRequest('GET', 'https://example.com/normal-page');
        
        $response = $this->middleware->process($request, $this->handler);
        
        self::assertEquals(200, $response->getStatusCode());
    }

    /**
     * @test
     */
    public function apiRequestAddsSecurityHeaders(): void
    {
        $request = new ServerRequest('GET', 'https://example.com/api/fluid/render');
        
        $response = $this->middleware->process($request, $this->handler);
        
        self::assertTrue($response->hasHeader('X-Content-Type-Options'));
        self::assertEquals('nosniff', $response->getHeaderLine('X-Content-Type-Options'));
        
        self::assertTrue($response->hasHeader('X-Frame-Options'));
        self::assertEquals('DENY', $response->getHeaderLine('X-Frame-Options'));
        
        self::assertTrue($response->hasHeader('X-XSS-Protection'));
        self::assertEquals('1; mode=block', $response->getHeaderLine('X-XSS-Protection'));
        
        self::assertTrue($response->hasHeader('Access-Control-Allow-Methods'));
        self::assertEquals('GET, POST, OPTIONS', $response->getHeaderLine('Access-Control-Allow-Methods'));
    }

    /**
     * @test
     */
    public function localhostOriginIsAllowed(): void
    {
        $request = new ServerRequest(
            'GET',
            'https://example.com/api/fluid/render',
            ['Origin' => 'http://localhost:6006']
        );
        
        $response = $this->middleware->process($request, $this->handler);
        
        self::assertEquals('http://localhost:6006', $response->getHeaderLine('Access-Control-Allow-Origin'));
    }

    /**
     * @test
     */
    public function ddevOriginIsAllowed(): void
    {
        $request = new ServerRequest(
            'GET',
            'https://example.com/api/fluid/render',
            ['Origin' => 'https://my-project.ddev.site']
        );
        
        $response = $this->middleware->process($request, $this->handler);
        
        self::assertEquals('https://my-project.ddev.site', $response->getHeaderLine('Access-Control-Allow-Origin'));
    }

    /**
     * @test
     */
    public function configuredOriginIsAllowed(): void
    {
        $request = new ServerRequest(
            'GET',
            'https://example.com/api/fluid/render',
            ['Origin' => 'https://storybook.example.com']
        );
        
        $response = $this->middleware->process($request, $this->handler);
        
        self::assertEquals('https://storybook.example.com', $response->getHeaderLine('Access-Control-Allow-Origin'));
    }

    /**
     * @test
     */
    public function unknownOriginIsBlocked(): void
    {
        $request = new ServerRequest(
            'GET',
            'https://example.com/api/fluid/render',
            ['Origin' => 'https://malicious.com']
        );
        
        $response = $this->middleware->process($request, $this->handler);
        
        self::assertEquals('', $response->getHeaderLine('Access-Control-Allow-Origin'));
    }

    /**
     * @test
     */
    public function rateLimitingWorks(): void
    {
        $request = new ServerRequest('GET', 'https://example.com/api/fluid/render');
        $request = $request->withServerParams(['REMOTE_ADDR' => '127.0.0.1']);
        
        // First 5 requests should succeed (rate limit is 5)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->middleware->process($request, $this->handler);
            self::assertEquals(200, $response->getStatusCode(), "Request $i should succeed");
        }
        
        // 6th request should be rate limited
        $response = $this->middleware->process($request, $this->handler);
        self::assertEquals(429, $response->getStatusCode());
        
        $body = json_decode((string)$response->getBody(), true);
        self::assertEquals('Rate limit exceeded', $body['error']);
    }

    /**
     * @test
     */
    public function differentIpsHaveSeparateRateLimits(): void
    {
        $request1 = new ServerRequest('GET', 'https://example.com/api/fluid/render');
        $request1 = $request1->withServerParams(['REMOTE_ADDR' => '127.0.0.1']);
        
        $request2 = new ServerRequest('GET', 'https://example.com/api/fluid/render');
        $request2 = $request2->withServerParams(['REMOTE_ADDR' => '192.168.1.1']);
        
        // Use up rate limit for first IP
        for ($i = 0; $i < 5; $i++) {
            $response = $this->middleware->process($request1, $this->handler);
            self::assertEquals(200, $response->getStatusCode());
        }
        
        // First IP should be rate limited
        $response = $this->middleware->process($request1, $this->handler);
        self::assertEquals(429, $response->getStatusCode());
        
        // Second IP should still work
        $response = $this->middleware->process($request2, $this->handler);
        self::assertEquals(200, $response->getStatusCode());
    }

    /**
     * @test
     */
    public function productionConfiguration(): void
    {
        // Override environment for production-like settings
        $_ENV['FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS'] = '50';
        $_ENV['FLUID_STORYBOOK_RATE_LIMIT_WINDOW_MINUTES'] = '10';
        $_ENV['FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS'] = 'https://storybook.production.com';
        
        $middleware = new SecurityMiddleware();
        
        $request = new ServerRequest('GET', 'https://example.com/api/fluid/render');
        $request = $request->withServerParams(['REMOTE_ADDR' => '127.0.0.1']);
        $request = $request->withHeader('Origin', 'https://storybook.production.com');
        
        $response = $middleware->process($request, $this->handler);
        
        self::assertEquals(200, $response->getStatusCode());
        self::assertEquals('https://storybook.production.com', $response->getHeaderLine('Access-Control-Allow-Origin'));
        
        // Should allow more requests due to higher rate limit
        for ($i = 0; $i < 20; $i++) {
            $response = $middleware->process($request, $this->handler);
            self::assertEquals(200, $response->getStatusCode(), "Request $i should succeed with production limits");
        }
    }

    /**
     * @test
     */
    public function ddevConfiguration(): void
    {
        // Override environment for DDEV-like settings
        $_ENV['FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS'] = '200';
        $_ENV['FLUID_STORYBOOK_RATE_LIMIT_WINDOW_MINUTES'] = '15';
        $_ENV['FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS'] = 'http://localhost:6006,http://localhost:6007,https://my-project.ddev.site:6006';
        
        $middleware = new SecurityMiddleware();
        
        $request = new ServerRequest('GET', 'https://example.com/api/fluid/render');
        $request = $request->withServerParams(['REMOTE_ADDR' => '127.0.0.1']);
        $request = $request->withHeader('Origin', 'https://my-project.ddev.site:6006');
        
        $response = $middleware->process($request, $this->handler);
        
        self::assertEquals(200, $response->getStatusCode());
        self::assertEquals('https://my-project.ddev.site:6006', $response->getHeaderLine('Access-Control-Allow-Origin'));
    }

    /**
     * @test
     */
    public function missingRemoteAddrHandledGracefully(): void
    {
        $request = new ServerRequest('GET', 'https://example.com/api/fluid/render');
        // No REMOTE_ADDR in server params
        
        $response = $this->middleware->process($request, $this->handler);
        
        // Should not crash and should process normally
        self::assertEquals(200, $response->getStatusCode());
    }
} 
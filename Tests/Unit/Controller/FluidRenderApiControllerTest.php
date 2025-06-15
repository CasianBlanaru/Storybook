<?php
declare(strict_types=1);

namespace MyVendor\MyFluidStorybook\Tests\Unit\Controller;

use MyVendor\MyFluidStorybook\Controller\FluidRenderApiController;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

/**
 * Test cases for FluidRenderApiController
 */
class FluidRenderApiControllerTest extends UnitTestCase
{
    protected FluidRenderApiController $subject;

    protected function setUp(): void
    {
        parent::setUp();
        $this->subject = new FluidRenderApiController();
    }

    /**
     * @test
     */
    public function renderActionReturnsBadRequestWhenTemplatePathMissing(): void
    {
        $request = new ServerRequest('GET', 'http://localhost/api/fluid/render');
        
        $response = $this->subject->renderAction($request);
        
        self::assertEquals(400, $response->getStatusCode());
        self::assertStringContainsString('templatePath', $response->getBody()->getContents());
    }

    /**
     * @test
     */
    public function renderActionReturnsBadRequestForInvalidTemplatePath(): void
    {
        $request = new ServerRequest('GET', 'http://localhost/api/fluid/render?templatePath=invalid');
        
        $response = $this->subject->renderAction($request);
        
        self::assertEquals(400, $response->getStatusCode());
        self::assertStringContainsString('Invalid "templatePath"', $response->getBody()->getContents());
    }

    /**
     * @test
     */
    public function renderActionReturnsBadRequestForInvalidVariablesJson(): void
    {
        $request = new ServerRequest(
            'GET', 
            'http://localhost/api/fluid/render?templatePath=EXT:test/Templates/Test.html&variables=invalid-json'
        );
        
        $response = $this->subject->renderAction($request);
        
        self::assertEquals(400, $response->getStatusCode());
        self::assertStringContainsString('Invalid JSON', $response->getBody()->getContents());
    }
} 
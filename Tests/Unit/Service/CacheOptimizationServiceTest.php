<?php

declare(strict_types=1);

namespace Vendor\FluidStorybook\Tests\Unit\Service;

use PHPUnit\Framework\TestCase;
use TYPO3\CMS\Core\Cache\CacheManager;
use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;
use Vendor\FluidStorybook\Service\CacheOptimizationService;

/**
 * Test case for CacheOptimizationService
 */
class CacheOptimizationServiceTest extends TestCase
{
    private CacheOptimizationService $service;
    private FrontendInterface $mockCache;
    private CacheManager $mockCacheManager;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Set up test environment variables
        $_ENV['FLUID_STORYBOOK_CACHE_IDENTIFIER'] = 'test_cache';
        $_ENV['FLUID_STORYBOOK_CACHE_LIFETIME'] = '1800';
        $_ENV['FLUID_STORYBOOK_PERFORMANCE_MONITORING'] = 'true';
        $_ENV['FLUID_STORYBOOK_ENVIRONMENT'] = 'test';
        
        // Mock cache frontend
        $this->mockCache = $this->createMock(FrontendInterface::class);
        
        // Mock cache manager
        $this->mockCacheManager = $this->createMock(CacheManager::class);
        $this->mockCacheManager
            ->method('getCache')
            ->with('test_cache')
            ->willReturn($this->mockCache);
        
        $this->service = new CacheOptimizationService($this->mockCacheManager);
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
    public function storeRenderedContentStoresDataCorrectly(): void
    {
        $cacheKey = 'test_key';
        $content = '<div>Test Content</div>';
        $variables = ['var1' => 'value1'];
        
        $this->mockCache
            ->expects(self::once())
            ->method('set')
            ->with(
                $cacheKey,
                self::callback(function ($data) use ($content, $variables) {
                    return is_array($data) &&
                           $data['content'] === $content &&
                           $data['variables'] === $variables &&
                           isset($data['timestamp']) &&
                           $data['environment'] === 'test';
                }),
                [],
                1800
            );
        
        $this->service->storeRenderedContent($cacheKey, $content, $variables);
    }

    /**
     * @test
     */
    public function getRenderedContentReturnsValidData(): void
    {
        $cacheKey = 'test_key';
        $cacheData = [
            'content' => '<div>Cached Content</div>',
            'variables' => ['var1' => 'value1'],
            'timestamp' => time(),
            'environment' => 'test'
        ];
        
        $this->mockCache
            ->method('get')
            ->with($cacheKey)
            ->willReturn($cacheData);
        
        $result = $this->service->getRenderedContent($cacheKey);
        
        self::assertEquals($cacheData, $result);
    }

    /**
     * @test
     */
    public function getRenderedContentReturnsNullForMissingEntry(): void
    {
        $cacheKey = 'missing_key';
        
        $this->mockCache
            ->method('get')
            ->with($cacheKey)
            ->willReturn(false);
        
        $result = $this->service->getRenderedContent($cacheKey);
        
        self::assertNull($result);
    }

    /**
     * @test
     */
    public function getRenderedContentRemovesInvalidEntries(): void
    {
        $cacheKey = 'invalid_key';
        $invalidData = ['invalid' => 'structure'];
        
        $this->mockCache
            ->method('get')
            ->with($cacheKey)
            ->willReturn($invalidData);
        
        $this->mockCache
            ->expects(self::once())
            ->method('remove')
            ->with($cacheKey);
        
        $result = $this->service->getRenderedContent($cacheKey);
        
        self::assertNull($result);
    }

    /**
     * @test
     */
    public function createCacheKeyGeneratesConsistentKey(): void
    {
        $templatePath = 'EXT:test/Templates/Test.html';
        $variables = ['var2' => 'value2', 'var1' => 'value1'];
        
        $key1 = $this->service->createCacheKey($templatePath, $variables);
        $key2 = $this->service->createCacheKey($templatePath, $variables);
        
        self::assertEquals($key1, $key2);
        self::assertEquals(32, strlen($key1)); // MD5 hash length
    }

    /**
     * @test
     */
    public function createCacheKeyDifferentForDifferentInputs(): void
    {
        $templatePath1 = 'EXT:test/Templates/Test1.html';
        $templatePath2 = 'EXT:test/Templates/Test2.html';
        $variables = ['var1' => 'value1'];
        
        $key1 = $this->service->createCacheKey($templatePath1, $variables);
        $key2 = $this->service->createCacheKey($templatePath2, $variables);
        
        self::assertNotEquals($key1, $key2);
    }

    /**
     * @test
     */
    public function createCacheKeyIgnoresVariableOrder(): void
    {
        $templatePath = 'EXT:test/Templates/Test.html';
        $variables1 = ['a' => '1', 'b' => '2'];
        $variables2 = ['b' => '2', 'a' => '1'];
        
        $key1 = $this->service->createCacheKey($templatePath, $variables1);
        $key2 = $this->service->createCacheKey($templatePath, $variables2);
        
        self::assertEquals($key1, $key2);
    }

    /**
     * @test
     */
    public function warmUpCacheProcessesTemplatesCorrectly(): void
    {
        $templates = [
            ['path' => 'EXT:test/Templates/Test1.html', 'variables' => []],
            ['path' => 'EXT:test/Templates/Test2.html', 'variables' => ['var' => 'val']],
            ['variables' => []] // Missing path, should be skipped
        ];
        
        // Mock cache get calls to return null (not cached)
        $this->mockCache
            ->method('get')
            ->willReturn(false);
        
        $results = $this->service->warmUpCache($templates);
        
        self::assertCount(2, $results); // Only valid templates
        self::assertEquals('queued_for_warmup', $results['EXT:test/Templates/Test1.html']);
        self::assertEquals('queued_for_warmup', $results['EXT:test/Templates/Test2.html']);
    }

    /**
     * @test
     */
    public function warmUpCacheSkipsAlreadyCachedTemplates(): void
    {
        $templates = [
            ['path' => 'EXT:test/Templates/Cached.html', 'variables' => []]
        ];
        
        // Mock cache get to return existing data
        $this->mockCache
            ->method('get')
            ->willReturn([
                'content' => '<div>Cached</div>',
                'timestamp' => time()
            ]);
        
        $results = $this->service->warmUpCache($templates);
        
        self::assertEquals('already_cached', $results['EXT:test/Templates/Cached.html']);
    }

    /**
     * @test
     */
    public function cleanExpiredEntriesCallsGarbageCollection(): void
    {
        $this->mockCache
            ->expects(self::once())
            ->method('collectGarbage');
        
        $count = $this->service->cleanExpiredEntries();
        
        self::assertIsInt($count);
    }

    /**
     * @test
     */
    public function getStatisticsReturnsCorrectData(): void
    {
        $stats = $this->service->getStatistics();
        
        self::assertIsArray($stats);
        self::assertEquals('test_cache', $stats['cache_identifier']);
        self::assertEquals(1800, $stats['cache_lifetime']);
        self::assertTrue($stats['performance_monitoring']);
        self::assertEquals('test', $stats['environment']);
        self::assertIsInt($stats['timestamp']);
    }

    /**
     * @test
     */
    public function clearAllSuccessfully(): void
    {
        $this->mockCache
            ->expects(self::once())
            ->method('flush');
        
        $result = $this->service->clearAll();
        
        self::assertTrue($result);
    }

    /**
     * @test
     */
    public function clearAllHandlesExceptions(): void
    {
        $this->mockCache
            ->method('flush')
            ->willThrowException(new \RuntimeException('Cache flush failed'));
        
        $result = $this->service->clearAll();
        
        self::assertFalse($result);
    }

    /**
     * @test
     */
    public function productionConfiguration(): void
    {
        // Override environment for production-like settings
        $_ENV['FLUID_STORYBOOK_CACHE_LIFETIME'] = '7200';
        $_ENV['FLUID_STORYBOOK_PERFORMANCE_MONITORING'] = 'false';
        $_ENV['FLUID_STORYBOOK_ENVIRONMENT'] = 'production';
        
        // Re-create service with production settings
        $service = new CacheOptimizationService($this->mockCacheManager);
        
        $stats = $service->getStatistics();
        
        self::assertEquals(7200, $stats['cache_lifetime']);
        self::assertFalse($stats['performance_monitoring']);
        self::assertEquals('production', $stats['environment']);
    }

    /**
     * @test
     */
    public function developmentConfiguration(): void
    {
        // Override environment for development-like settings
        $_ENV['FLUID_STORYBOOK_CACHE_LIFETIME'] = '300';
        $_ENV['FLUID_STORYBOOK_PERFORMANCE_MONITORING'] = 'true';
        $_ENV['FLUID_STORYBOOK_ENVIRONMENT'] = 'development';
        
        // Re-create service with development settings
        $service = new CacheOptimizationService($this->mockCacheManager);
        
        $stats = $service->getStatistics();
        
        self::assertEquals(300, $stats['cache_lifetime']);
        self::assertTrue($stats['performance_monitoring']);
        self::assertEquals('development', $stats['environment']);
    }
} 
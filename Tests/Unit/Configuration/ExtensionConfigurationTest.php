<?php

declare(strict_types=1);

namespace Vendor\FluidStorybook\Tests\Unit\Configuration;

use PHPUnit\Framework\TestCase;
use Vendor\FluidStorybook\Configuration\ExtensionConfiguration;

/**
 * Test case for ExtensionConfiguration
 */
class ExtensionConfigurationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Clear environment variables before each test
        foreach ($_ENV as $key => $value) {
            if (str_starts_with($key, 'FLUID_STORYBOOK_')) {
                unset($_ENV[$key]);
            }
        }
    }

    protected function tearDown(): void
    {
        // Clean up environment variables after each test
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
    public function defaultConfigurationValues(): void
    {
        self::assertEquals('fluid_storybook', ExtensionConfiguration::get('extension_key'));
        self::assertEquals('fluid_storybook_renderresults', ExtensionConfiguration::get('cache_identifier'));
        self::assertEquals('/api/fluid/render', ExtensionConfiguration::get('api_render_endpoint'));
        self::assertEquals('http://localhost', ExtensionConfiguration::get('typo3_base_url'));
        self::assertEquals(100, ExtensionConfiguration::get('rate_limit_max_requests'));
        self::assertEquals(15, ExtensionConfiguration::get('rate_limit_window_minutes'));
        self::assertEquals(3600, ExtensionConfiguration::getCacheLifetime());
        self::assertTrue(ExtensionConfiguration::isPerformanceMonitoringEnabled());
    }

    /**
     * @test
     */
    public function environmentVariableOverride(): void
    {
        $_ENV['FLUID_STORYBOOK_EXTENSION_KEY'] = 'custom_extension';
        $_ENV['FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS'] = '200';
        $_ENV['FLUID_STORYBOOK_PERFORMANCE_MONITORING'] = 'false';
        $_ENV['FLUID_STORYBOOK_CACHE_LIFETIME'] = '7200';

        self::assertEquals('custom_extension', ExtensionConfiguration::get('extension_key'));
        self::assertEquals(200, ExtensionConfiguration::get('rate_limit_max_requests'));
        self::assertFalse(ExtensionConfiguration::isPerformanceMonitoringEnabled());
        self::assertEquals(7200, ExtensionConfiguration::getCacheLifetime());
    }

    /**
     * @test
     */
    public function booleanValueParsing(): void
    {
        // Test different boolean representations
        $_ENV['FLUID_STORYBOOK_PERFORMANCE_MONITORING'] = 'true';
        self::assertTrue(ExtensionConfiguration::get('performance_monitoring'));

        $_ENV['FLUID_STORYBOOK_PERFORMANCE_MONITORING'] = '1';
        self::assertTrue(ExtensionConfiguration::get('performance_monitoring'));

        $_ENV['FLUID_STORYBOOK_PERFORMANCE_MONITORING'] = 'yes';
        self::assertTrue(ExtensionConfiguration::get('performance_monitoring'));

        $_ENV['FLUID_STORYBOOK_PERFORMANCE_MONITORING'] = 'on';
        self::assertTrue(ExtensionConfiguration::get('performance_monitoring'));

        $_ENV['FLUID_STORYBOOK_PERFORMANCE_MONITORING'] = 'false';
        self::assertFalse(ExtensionConfiguration::get('performance_monitoring'));

        $_ENV['FLUID_STORYBOOK_PERFORMANCE_MONITORING'] = '0';
        self::assertFalse(ExtensionConfiguration::get('performance_monitoring'));

        $_ENV['FLUID_STORYBOOK_PERFORMANCE_MONITORING'] = 'no';
        self::assertFalse(ExtensionConfiguration::get('performance_monitoring'));

        $_ENV['FLUID_STORYBOOK_PERFORMANCE_MONITORING'] = 'off';
        self::assertFalse(ExtensionConfiguration::get('performance_monitoring'));
    }

    /**
     * @test
     */
    public function numericValueParsing(): void
    {
        $_ENV['FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS'] = '150';
        self::assertEquals(150, ExtensionConfiguration::get('rate_limit_max_requests'));
        self::assertIsInt(ExtensionConfiguration::get('rate_limit_max_requests'));

        $_ENV['FLUID_STORYBOOK_CACHE_LIFETIME'] = '3600.5';
        self::assertEquals(3600.5, ExtensionConfiguration::get('cache_lifetime'));
        self::assertIsFloat(ExtensionConfiguration::get('cache_lifetime'));
    }

    /**
     * @test
     */
    public function corsAllowedOriginsArray(): void
    {
        $_ENV['FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS'] = 'https://storybook.example.com,https://preview.example.com';
        
        $origins = ExtensionConfiguration::getCorsAllowedOrigins();
        
        self::assertIsArray($origins);
        self::assertCount(2, $origins);
        self::assertContains('https://storybook.example.com', $origins);
        self::assertContains('https://preview.example.com', $origins);
    }

    /**
     * @test
     */
    public function corsAllowedOriginsSingle(): void
    {
        $_ENV['FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS'] = 'https://storybook.example.com';
        
        $origins = ExtensionConfiguration::getCorsAllowedOrigins();
        
        self::assertIsArray($origins);
        self::assertCount(1, $origins);
        self::assertEquals('https://storybook.example.com', $origins[0]);
    }

    /**
     * @test
     */
    public function productionConfiguration(): void
    {
        // Simulate production environment variables
        $_ENV['FLUID_STORYBOOK_TYPO3_BASE_URL'] = 'https://example.com';
        $_ENV['FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS'] = 'https://storybook.example.com';
        $_ENV['FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS'] = '50';
        $_ENV['FLUID_STORYBOOK_RATE_LIMIT_WINDOW_MINUTES'] = '10';
        $_ENV['FLUID_STORYBOOK_CACHE_LIFETIME'] = '7200';
        $_ENV['FLUID_STORYBOOK_PERFORMANCE_MONITORING'] = 'false';

        self::assertEquals('https://example.com', ExtensionConfiguration::get('typo3_base_url'));
        self::assertEquals(['https://storybook.example.com'], ExtensionConfiguration::getCorsAllowedOrigins());
        self::assertEquals(50, ExtensionConfiguration::get('rate_limit_max_requests'));
        self::assertEquals(10, ExtensionConfiguration::get('rate_limit_window_minutes'));
        self::assertEquals(7200, ExtensionConfiguration::getCacheLifetime());
        self::assertFalse(ExtensionConfiguration::isPerformanceMonitoringEnabled());
    }

    /**
     * @test
     */
    public function ddevConfiguration(): void
    {
        // Simulate DDEV environment variables
        $_ENV['FLUID_STORYBOOK_TYPO3_BASE_URL'] = 'https://my-project.ddev.site';
        $_ENV['FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS'] = 'http://localhost:6006,http://localhost:6007,https://my-project.ddev.site:6006';
        $_ENV['FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS'] = '200';
        $_ENV['FLUID_STORYBOOK_CACHE_LIFETIME'] = '1800';
        $_ENV['FLUID_STORYBOOK_PERFORMANCE_MONITORING'] = 'true';

        self::assertEquals('https://my-project.ddev.site', ExtensionConfiguration::get('typo3_base_url'));
        
        $expectedOrigins = [
            'http://localhost:6006',
            'http://localhost:6007',
            'https://my-project.ddev.site:6006'
        ];
        self::assertEquals($expectedOrigins, ExtensionConfiguration::getCorsAllowedOrigins());
        
        self::assertEquals(200, ExtensionConfiguration::get('rate_limit_max_requests'));
        self::assertEquals(1800, ExtensionConfiguration::getCacheLifetime());
        self::assertTrue(ExtensionConfiguration::isPerformanceMonitoringEnabled());
    }

    /**
     * @test
     */
    public function unknownConfigurationKey(): void
    {
        $result = ExtensionConfiguration::get('unknown_key', 'default_value');
        self::assertEquals('default_value', $result);
    }

    /**
     * @test
     */
    public function nullDefaultValue(): void
    {
        $result = ExtensionConfiguration::get('unknown_key');
        self::assertNull($result);
    }
} 
<?php

declare(strict_types=1);

namespace Vendor\FluidStorybook\Configuration;

use TYPO3\CMS\Core\SingletonInterface;

/**
 * Extension Configuration Manager
 * 
 * Centralizes all configuration values and provides environment variable support
 */
class ExtensionConfiguration implements SingletonInterface
{
    // Extension Settings
    public const EXTENSION_KEY = 'fluid_storybook';
    public const CACHE_IDENTIFIER = 'fluid_storybook_renderresults';
    
    // API Endpoints
    public const API_BASE_PATH = '/api/fluid';
    public const API_RENDER_ENDPOINT = '/api/fluid/render';
    public const API_DATA_ENDPOINT = '/api/fluid/data';
    
    // Default URLs for development
    public const DEFAULT_TYPO3_BASE_URL = 'http://localhost';
    public const DEFAULT_STORYBOOK_BASE_URL = 'http://localhost:6006';
    public const DEFAULT_STORYBOOK_STATIC_URL = 'http://localhost:6007';
    
    // Security defaults
    public const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 100;
    public const DEFAULT_RATE_LIMIT_WINDOW_MINUTES = 15;
    public const DEFAULT_CORS_ALLOWED_ORIGINS = 'http://localhost:6006,http://localhost:6007';
    
    // Cache settings
    public const DEFAULT_CACHE_LIFETIME = 3600;
    
    // Performance settings
    public const DEFAULT_PERFORMANCE_MONITORING = true;

    /**
     * Get configuration value with environment variable support
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        // Try environment variable first (with FLUID_STORYBOOK_ prefix)
        $envKey = 'FLUID_STORYBOOK_' . strtoupper($key);
        $envValue = getenv($envKey);
        
        if ($envValue !== false) {
            return self::parseEnvValue($envValue);
        }
        
        // Fallback to constants
        return match($key) {
            'extension_key' => self::EXTENSION_KEY,
            'cache_identifier' => self::CACHE_IDENTIFIER,
            'api_base_path' => self::API_BASE_PATH,
            'api_render_endpoint' => self::API_RENDER_ENDPOINT,
            'api_data_endpoint' => self::API_DATA_ENDPOINT,
            'typo3_base_url' => self::DEFAULT_TYPO3_BASE_URL,
            'storybook_base_url' => self::DEFAULT_STORYBOOK_BASE_URL,
            'storybook_static_url' => self::DEFAULT_STORYBOOK_STATIC_URL,
            'rate_limit_max_requests' => self::DEFAULT_RATE_LIMIT_MAX_REQUESTS,
            'rate_limit_window_minutes' => self::DEFAULT_RATE_LIMIT_WINDOW_MINUTES,
            'cors_allowed_origins' => self::DEFAULT_CORS_ALLOWED_ORIGINS,
            'cache_lifetime' => self::DEFAULT_CACHE_LIFETIME,
            'performance_monitoring' => self::DEFAULT_PERFORMANCE_MONITORING,
            default => $default,
        };
    }

    /**
     * Parse environment variable value to correct type
     */
    private static function parseEnvValue(string $value): mixed
    {
        // Handle boolean values
        if (in_array(strtolower($value), ['true', '1', 'yes', 'on'])) {
            return true;
        }
        if (in_array(strtolower($value), ['false', '0', 'no', 'off'])) {
            return false;
        }
        
        // Handle numeric values
        if (is_numeric($value)) {
            return strpos($value, '.') !== false ? (float)$value : (int)$value;
        }
        
        return $value;
    }

    /**
     * Get CORS allowed origins as array
     */
    public static function getCorsAllowedOrigins(): array
    {
        $origins = self::get('cors_allowed_origins');
        return is_string($origins) ? explode(',', $origins) : [$origins];
    }

    /**
     * Check if performance monitoring is enabled
     */
    public static function isPerformanceMonitoringEnabled(): bool
    {
        return (bool)self::get('performance_monitoring');
    }

    /**
     * Get cache lifetime in seconds
     */
    public static function getCacheLifetime(): int
    {
        return (int)self::get('cache_lifetime');
    }
} 
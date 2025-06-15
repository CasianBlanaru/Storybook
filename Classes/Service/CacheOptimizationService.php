<?php

declare(strict_types=1);

namespace Vendor\FluidStorybook\Service;

use TYPO3\CMS\Core\Cache\CacheManager;
use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;
use TYPO3\CMS\Core\SingletonInterface;
use Vendor\FluidStorybook\Configuration\ExtensionConfiguration;

/**
 * Cache optimization service for Fluid Storybook
 * Handles environment-aware caching strategies
 */
class CacheOptimizationService implements SingletonInterface
{
    private FrontendInterface $cache;
    private int $cacheLifetime;
    private bool $performanceMonitoring;

    public function __construct(CacheManager $cacheManager)
    {
        $this->cache = $cacheManager->getCache(ExtensionConfiguration::get('cache_identifier'));
        $this->cacheLifetime = ExtensionConfiguration::getCacheLifetime();
        $this->performanceMonitoring = ExtensionConfiguration::isPerformanceMonitoringEnabled();
    }

    /**
     * Store rendered content with optimized cache strategy
     */
    public function storeRenderedContent(string $cacheKey, string $content, array $variables = []): void
    {
        $startTime = $this->performanceMonitoring ? microtime(true) : 0;

        // Create cache entry with metadata
        $cacheData = [
            'content' => $content,
            'variables' => $variables,
            'timestamp' => time(),
            'environment' => ExtensionConfiguration::get('environment', 'unknown')
        ];

        // Use environment-specific cache lifetime
        $this->cache->set($cacheKey, $cacheData, [], $this->cacheLifetime);

        if ($this->performanceMonitoring) {
            $executionTime = microtime(true) - $startTime;
            $this->logPerformance('cache_store', $executionTime, ['key' => $cacheKey, 'size' => strlen($content)]);
        }
    }

    /**
     * Retrieve cached content with validation
     */
    public function getRenderedContent(string $cacheKey): ?array
    {
        $startTime = $this->performanceMonitoring ? microtime(true) : 0;

        $cachedData = $this->cache->get($cacheKey);

        if ($this->performanceMonitoring) {
            $executionTime = microtime(true) - $startTime;
            $this->logPerformance('cache_get', $executionTime, [
                'key' => $cacheKey, 
                'hit' => $cachedData !== false
            ]);
        }

        if ($cachedData === false) {
            return null;
        }

        // Validate cache entry structure
        if (!is_array($cachedData) || !isset($cachedData['content'], $cachedData['timestamp'])) {
            $this->cache->remove($cacheKey); // Remove invalid entry
            return null;
        }

        return $cachedData;
    }

    /**
     * Create optimized cache key based on template and variables
     */
    public function createCacheKey(string $templatePath, array $variables = []): string
    {
        // Sort variables for consistent keys
        ksort($variables);
        
        $keyComponents = [
            'template' => $templatePath,
            'vars' => md5(json_encode($variables)),
            'env' => ExtensionConfiguration::get('environment', 'dev')
        ];

        return md5(json_encode($keyComponents));
    }

    /**
     * Warm up cache for frequently used templates
     */
    public function warmUpCache(array $templates): array
    {
        $results = [];
        $startTime = microtime(true);

        foreach ($templates as $template) {
            $templatePath = $template['path'] ?? '';
            $variables = $template['variables'] ?? [];
            
            if (empty($templatePath)) {
                continue;
            }

            $cacheKey = $this->createCacheKey($templatePath, $variables);
            
            // Check if already cached
            if ($this->getRenderedContent($cacheKey) !== null) {
                $results[$templatePath] = 'already_cached';
                continue;
            }

            // Pre-render would happen here in a real implementation
            // This is just a placeholder for the warm-up logic
            $results[$templatePath] = 'queued_for_warmup';
        }

        if ($this->performanceMonitoring) {
            $totalTime = microtime(true) - $startTime;
            $this->logPerformance('cache_warmup', $totalTime, [
                'templates_count' => count($templates),
                'results' => $results
            ]);
        }

        return $results;
    }

    /**
     * Clean expired cache entries
     */
    public function cleanExpiredEntries(): int
    {
        $startTime = $this->performanceMonitoring ? microtime(true) : 0;
        $cleanedCount = 0;

        // Get all cache entries (this is a simplified approach)
        // In a real implementation, you'd use cache tags or other mechanisms
        $this->cache->collectGarbage();
        
        if ($this->performanceMonitoring) {
            $executionTime = microtime(true) - $startTime;
            $this->logPerformance('cache_cleanup', $executionTime, ['cleaned_count' => $cleanedCount]);
        }

        return $cleanedCount;
    }

    /**
     * Get cache statistics
     */
    public function getStatistics(): array
    {
        return [
            'cache_identifier' => ExtensionConfiguration::get('cache_identifier'),
            'cache_lifetime' => $this->cacheLifetime,
            'performance_monitoring' => $this->performanceMonitoring,
            'environment' => ExtensionConfiguration::get('environment', 'unknown'),
            'timestamp' => time()
        ];
    }

    /**
     * Clear all Fluid Storybook cache
     */
    public function clearAll(): bool
    {
        $startTime = $this->performanceMonitoring ? microtime(true) : 0;

        try {
            $this->cache->flush();
            
            if ($this->performanceMonitoring) {
                $executionTime = microtime(true) - $startTime;
                $this->logPerformance('cache_clear_all', $executionTime, ['success' => true]);
            }
            
            return true;
        } catch (\Throwable $e) {
            if ($this->performanceMonitoring) {
                $executionTime = microtime(true) - $startTime;
                $this->logPerformance('cache_clear_all', $executionTime, [
                    'success' => false,
                    'error' => $e->getMessage()
                ]);
            }
            
            return false;
        }
    }

    /**
     * Log performance metrics if monitoring is enabled
     */
    private function logPerformance(string $operation, float $executionTime, array $metadata = []): void
    {
        if (!$this->performanceMonitoring) {
            return;
        }

        $logData = [
            'operation' => $operation,
            'execution_time_ms' => round($executionTime * 1000, 2),
            'timestamp' => microtime(true),
            'metadata' => $metadata
        ];

        // In a real implementation, you might use TYPO3's logging framework
        // For now, we'll just write to a simple log format
        error_log('FluidStorybook Performance: ' . json_encode($logData));
    }
} 
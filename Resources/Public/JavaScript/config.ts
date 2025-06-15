/**
 * Fluid Storybook Configuration (TypeScript/CommonJS)
 * 
 * Simple configuration with environment-specific values.
 */

// Environment detection (with fallbacks for Node.js)
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname.includes('.ddev.site'));

const isStorybook = typeof window !== 'undefined' && 
  (window.location.port === '6006' || window.location.port === '6007');

// Detect environment
function detectEnvironment(): string {
  if (isStorybook) return 'storybook';
  if (typeof window !== 'undefined' && window.location.hostname.includes('.ddev.site')) return 'ddev';
  if (isDevelopment) return 'development';
  return 'production';
}

const environment = detectEnvironment();

// Configuration class with static methods for easy use
class FluidStorybookConfig {
  // API Configuration
  static readonly API_BASE_PATH = '/api/fluid';
  static readonly API_RENDER_ENDPOINT = '/api/fluid/render';
  static readonly API_DATA_ENDPOINT = '/api/fluid/data';
  static readonly API_TIMEOUT = environment === 'storybook' ? 10000 : 30000;

  // URLs
  static readonly TYPO3_BASE_URL = environment === 'ddev' && typeof window !== 'undefined'
    ? `https://${window.location.hostname}`
    : (isDevelopment ? 'http://localhost' : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost'));
  
  static readonly STORYBOOK_BASE_URL = 'http://localhost:6006';
  static readonly STORYBOOK_STATIC_URL = 'http://localhost:6007';

  // Cache settings
  static readonly CACHE_ENABLED = true;
  static readonly CACHE_LIFETIME = environment === 'production' ? 600000 : 300000; // 10min/5min
  static readonly CACHE_MAX_ENTRIES = environment === 'production' ? 200 : 100;

  // Performance
  static readonly PERFORMANCE_MONITORING = isDevelopment;
  static readonly DEBOUNCE_MS = environment === 'storybook' ? 100 : 300;
  static readonly ENABLE_ABORT_CONTROLLER = true;

  // Error handling
  static readonly ENABLE_CONSOLE_LOGGING = isDevelopment;
  static readonly ENABLE_RETRY = true;
  static readonly MAX_RETRIES = 3;
  static readonly RETRY_DELAY = 1000;

  // Development
  static readonly IS_DEVELOPMENT = isDevelopment;
  static readonly IS_STORYBOOK = isStorybook;
  static readonly ENVIRONMENT = environment;
  static readonly VERBOSE_LOGGING = isDevelopment;

  /**
   * Get API render endpoint
   */
  static getApiEndpoint(): string {
    return this.API_RENDER_ENDPOINT;
  }

  /**
   * Get full API URL with base URL
   */
  static getFullApiUrl(): string {
    return `${this.TYPO3_BASE_URL}${this.API_RENDER_ENDPOINT}`;
  }

  /**
   * Get cache configuration
   */
  static getCacheConfig() {
    return {
      enabled: this.CACHE_ENABLED,
      lifetime: this.CACHE_LIFETIME,
      maxEntries: this.CACHE_MAX_ENTRIES,
    };
  }

  /**
   * Get performance configuration
   */
  static getPerformanceConfig() {
    return {
      monitoring: this.PERFORMANCE_MONITORING,
      debounceMs: this.DEBOUNCE_MS,
      enableAbortController: this.ENABLE_ABORT_CONTROLLER,
    };
  }

  /**
   * Check if we should log to console
   */
  static shouldLogToConsole(): boolean {
    return this.ENABLE_CONSOLE_LOGGING;
  }

  /**
   * Get environment info
   */
  static getEnvironmentInfo() {
    return {
      environment: this.ENVIRONMENT,
      isDevelopment: this.IS_DEVELOPMENT,
      isStorybook: this.IS_STORYBOOK,
      verbose: this.VERBOSE_LOGGING,
    };
  }
}

// Log configuration in development
if (FluidStorybookConfig.VERBOSE_LOGGING && typeof console !== 'undefined') {
  console.log('Fluid Storybook Configuration:', {
    environment: FluidStorybookConfig.ENVIRONMENT,
    apiEndpoint: FluidStorybookConfig.getApiEndpoint(),
    typo3BaseUrl: FluidStorybookConfig.TYPO3_BASE_URL,
    cacheConfig: FluidStorybookConfig.getCacheConfig(),
    performanceConfig: FluidStorybookConfig.getPerformanceConfig(),
  });
}

// Export as both CommonJS and ES6 module
module.exports = FluidStorybookConfig;
module.exports.default = FluidStorybookConfig;
export default FluidStorybookConfig; 
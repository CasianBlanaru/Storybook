/**
 * Fluid Storybook Configuration
 * 
 * Environment-specific configuration for the FluidTemplate JavaScript module.
 * This file can be customized per environment or use environment variables.
 */

// Environment detection
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname.includes('.ddev.site');
const isStorybook = window.location.port === '6006' || window.location.port === '6007';

// Default configuration
const defaultConfig = {
  // API Configuration
  api: {
    basePath: '/api/fluid',
    renderEndpoint: '/api/fluid/render',
    dataEndpoint: '/api/fluid/data',
    timeout: 30000, // 30 seconds
  },
  
  // Base URLs for different environments
  urls: {
    typo3: isDevelopment 
      ? (window.location.hostname.includes('.ddev.site') 
         ? `https://${window.location.hostname}` 
         : 'http://localhost')
      : window.location.origin,
    storybook: 'http://localhost:6006',
    storybookStatic: 'http://localhost:6007',
  },
  
  // Cache configuration
  cache: {
    enabled: true,
    lifetime: 300000, // 5 minutes in milliseconds
    maxEntries: 100,
  },
  
  // Performance settings
  performance: {
    monitoring: isDevelopment,
    debounceMs: 300,
    enableAbortController: true,
  },
  
  // Error handling
  errors: {
    enableConsoleLogging: isDevelopment,
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
  },
  
  // Development settings
  development: {
    enabled: isDevelopment,
    verbose: isDevelopment,
    mockApi: false,
  }
};

// Environment-specific overrides
const environmentConfig = {
  development: {
    urls: {
      typo3: 'http://localhost',
    },
    performance: {
      monitoring: true,
    },
    errors: {
      enableConsoleLogging: true,
    },
  },
  
  ddev: {
    urls: {
      typo3: window.location.hostname.includes('.ddev.site') 
        ? `https://${window.location.hostname}` 
        : 'http://localhost',
    },
  },
  
  production: {
    cache: {
      lifetime: 600000, // 10 minutes
      maxEntries: 200,
    },
    performance: {
      monitoring: false,
    },
    errors: {
      enableConsoleLogging: false,
    },
  },
  
  storybook: {
    // Configuration when running inside Storybook
    api: {
      timeout: 10000, // Shorter timeout for Storybook
    },
    performance: {
      debounceMs: 100, // Faster response in Storybook
    },
  }
};

// Detect current environment
function detectEnvironment() {
  if (isStorybook) return 'storybook';
  if (window.location.hostname.includes('.ddev.site')) return 'ddev';
  if (isDevelopment) return 'development';
  return 'production';
}

// Merge configurations
function mergeConfig(base, override) {
  const result = { ...base };
  
  for (const key in override) {
    if (typeof override[key] === 'object' && !Array.isArray(override[key])) {
      result[key] = mergeConfig(result[key] || {}, override[key]);
    } else {
      result[key] = override[key];
    }
  }
  
  return result;
}

// Create final configuration
const environment = detectEnvironment();
const envOverrides = environmentConfig[environment] || {};

// Support for environment variables via meta tags
const metaConfig = {};
const metaTags = document.querySelectorAll('meta[name^="fluid-storybook-"]');
metaTags.forEach(meta => {
  const key = meta.getAttribute('name').replace('fluid-storybook-', '').replace(/-/g, '.');
  const value = meta.getAttribute('content');
  
  // Simple nested key support (e.g., "api.timeout")
  const keys = key.split('.');
  let current = metaConfig;
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = current[keys[i]] || {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
});

// Final configuration with all overrides applied
export const FluidStorybookConfig = mergeConfig(
  mergeConfig(defaultConfig, envOverrides),
  metaConfig
);

// Expose environment detection for debugging
FluidStorybookConfig.environment = environment;
FluidStorybookConfig.isDevelopment = isDevelopment;
FluidStorybookConfig.isStorybook = isStorybook;

// Log configuration in development
if (FluidStorybookConfig.development.verbose) {
  console.log('Fluid Storybook Configuration:', FluidStorybookConfig);
}

export default FluidStorybookConfig; 
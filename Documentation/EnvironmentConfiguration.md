# Environment Configuration

This document describes how to configure the TYPO3 Fluid Storybook extension using environment variables.

## Configuration Class

The extension uses the `Vendor\FluidStorybook\Configuration\ExtensionConfiguration` class to manage all configuration values. This class supports environment variables with automatic fallbacks to sensible defaults.

## Environment Variables

All environment variables use the prefix `FLUID_STORYBOOK_` followed by the setting name in uppercase.

### Available Settings

Create a `.env` file in your project root or set these environment variables:

```bash
# Extension Configuration
FLUID_STORYBOOK_EXTENSION_KEY=fluid_storybook
FLUID_STORYBOOK_CACHE_IDENTIFIER=fluid_storybook_renderresults

# API Configuration
FLUID_STORYBOOK_API_BASE_PATH=/api/fluid
FLUID_STORYBOOK_API_RENDER_ENDPOINT=/api/fluid/render
FLUID_STORYBOOK_API_DATA_ENDPOINT=/api/fluid/data

# Development URLs
FLUID_STORYBOOK_TYPO3_BASE_URL=http://localhost
FLUID_STORYBOOK_STORYBOOK_BASE_URL=http://localhost:6006
FLUID_STORYBOOK_STORYBOOK_STATIC_URL=http://localhost:6007

# Security Configuration
FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS=100
FLUID_STORYBOOK_RATE_LIMIT_WINDOW_MINUTES=15
FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS=http://localhost:6006,http://localhost:6007

# Cache Configuration
FLUID_STORYBOOK_CACHE_LIFETIME=3600

# Performance
FLUID_STORYBOOK_PERFORMANCE_MONITORING=true
```

## Usage in Code

### Basic Usage

```php
use Vendor\FluidStorybook\Configuration\ExtensionConfiguration;

// Get a configuration value
$apiEndpoint = ExtensionConfiguration::get('api_render_endpoint');

// Get with custom default
$customValue = ExtensionConfiguration::get('custom_setting', 'default_value');
```

### Specialized Methods

```php
// Get CORS origins as array
$allowedOrigins = ExtensionConfiguration::getCorsAllowedOrigins();

// Check if performance monitoring is enabled
if (ExtensionConfiguration::isPerformanceMonitoringEnabled()) {
    // Enable performance monitoring
}

// Get cache lifetime
$cacheLifetime = ExtensionConfiguration::getCacheLifetime();
```

## Default Values

If no environment variable is set, the following defaults are used:

| Setting | Default Value |
|---------|---------------|
| Extension Key | `fluid_storybook` |
| Cache Identifier | `fluid_storybook_renderresults` |
| API Render Endpoint | `/api/fluid/render` |
| API Data Endpoint | `/api/fluid/data` |
| TYPO3 Base URL | `http://localhost` |
| Storybook Base URL | `http://localhost:6006` |
| Rate Limit Max Requests | `100` |
| Rate Limit Window (minutes) | `15` |
| CORS Allowed Origins | `http://localhost:6006,http://localhost:6007` |
| Cache Lifetime (seconds) | `3600` |
| Performance Monitoring | `true` |

## Type Conversion

Environment variables are automatically converted to the appropriate types:

- **Boolean**: `true`, `1`, `yes`, `on` → `true`; `false`, `0`, `no`, `off` → `false`
- **Integer**: Numeric strings without decimal points
- **Float**: Numeric strings with decimal points
- **String**: All other values

## DDEV Configuration

For DDEV setups, add your environment variables to `.ddev/config.yaml`:

```yaml
web_environment:
  - FLUID_STORYBOOK_TYPO3_BASE_URL=https://my-project.ddev.site
  - FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS=http://localhost:6006,https://my-project.ddev.site:6006
```

## Docker Configuration

For Docker setups, add to your `docker-compose.yml`:

```yaml
environment:
  - FLUID_STORYBOOK_TYPO3_BASE_URL=http://web
  - FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS=http://localhost:6006
```

## Production Settings - Implementiert ✅

### Optimierte Konfiguration für Production

Die Extension bietet jetzt **spezielle Production-Settings** mit optimierten Cache-Laufzeiten, CORS-Sicherheit und Performance-Monitoring:

#### 🚀 **Quick Setup für Production**

1. **Umgebungsvariablen konfigurieren:**
   ```bash
   # Kopieren Sie die Production-Vorlage
   cp Configuration/Environment/production.env.example .env
   
   # Anpassen der URLs für Ihre Domain
   FLUID_STORYBOOK_TYPO3_BASE_URL=https://ihre-typo3-site.com
   FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS=https://storybook.ihre-typo3-site.com
   ```

2. **Cache-Optimierung:**
   ```bash
   # Erweiterte Cache-Laufzeit für Production (2 Stunden)
   FLUID_STORYBOOK_CACHE_LIFETIME=7200
   
   # Performance-Monitoring deaktivieren für bessere Performance
   FLUID_STORYBOOK_PERFORMANCE_MONITORING=false
   ```

3. **Security-Settings:**
   ```bash
   # Reduzierte Rate Limits für Production
   FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS=50
   FLUID_STORYBOOK_RATE_LIMIT_WINDOW_MINUTES=10
   ```

#### 🔧 **Verschiedene Hosting-Szenarien**

**Szenario 1: Hauptseite + Storybook Subdomain**
```bash
FLUID_STORYBOOK_TYPO3_BASE_URL=https://example.com
FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS=https://storybook.example.com
```

**Szenario 2: Getrennte Domains**
```bash
FLUID_STORYBOOK_TYPO3_BASE_URL=https://cms.example.com
FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS=https://components.example.com
```

**Szenario 3: CDN mit mehreren Umgebungen**
```bash
FLUID_STORYBOOK_TYPO3_BASE_URL=https://api.example.com
FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS=https://storybook.example.com,https://staging-storybook.example.com
```

#### ⚡ **Performance-Optimierungen**

- **Cache-Lifetime**: 7200 Sekunden (2 Stunden) für Production
- **Rate Limiting**: 50 Requests pro 10 Minuten (statt 100/15min)
- **CORS-Kontrolle**: Nur konfigurierte Domains erlaubt
- **Performance-Monitoring**: Optional deaktivierbar
- **CacheOptimizationService**: Automatische Cache-Verwaltung mit Environment-Awareness

#### 🧪 **Integrierte Tests**

Alle Production-Settings werden durch umfassende Tests abgedeckt:
- ✅ ExtensionConfigurationTest (PHP Unit Tests)
- ✅ SecurityMiddlewareTest (PHP Unit Tests) 
- ✅ CacheOptimizationServiceTest (PHP Unit Tests)
- ✅ FluidTemplate Tests (JavaScript Jest Tests)

## Production Recommendations

For production environments:

```bash
# Use HTTPS and production domains
FLUID_STORYBOOK_TYPO3_BASE_URL=https://your-site.com
FLUID_STORYBOOK_STORYBOOK_BASE_URL=https://storybook.your-site.com

# Restrict CORS origins
FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS=https://storybook.your-site.com

# Increase cache lifetime
FLUID_STORYBOOK_CACHE_LIFETIME=7200

# Adjust rate limiting
FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS=50
FLUID_STORYBOOK_RATE_LIMIT_WINDOW_MINUTES=10

# Disable performance monitoring for production
FLUID_STORYBOOK_PERFORMANCE_MONITORING=false
``` 
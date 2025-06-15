# API Reference

Umfassende Dokumentation aller APIs und Schnittstellen der TYPO3 Fluid Storybook Integration.

## 🌐 **HTTP API Endpoints**

### **Fluid Render API**

#### **POST /api/fluid/render**

Rendert ein Fluid Template mit den bereitgestellten Variablen.

**Request Parameters:**
```javascript
{
  "templatePath": "EXT:my_extension/Resources/Private/Templates/MyTemplate.html",
  "variables": {
    "title": "Hello World",
    "items": ["item1", "item2", "item3"]
  }
}
```

**Response (Success):**
```javascript
{
  "html": "<div><h1>Hello World</h1><ul><li>item1</li><li>item2</li><li>item3</li></ul></div>",
  "cached": false,
  "renderTime": 12.5
}
```

**Response (Error):**
```javascript
{
  "error": "Template not found",
  "code": "TEMPLATE_NOT_FOUND",
  "details": {
    "templatePath": "EXT:invalid/Template.html",
    "searchPaths": [
      "/var/www/html/typo3conf/ext/invalid/Resources/Private/Templates/"
    ]
  }
}
```

**HTTP Status Codes:**
- `200 OK`: Template erfolgreich gerendert
- `400 Bad Request`: Ungültige Parameter
- `404 Not Found`: Template nicht gefunden
- `500 Internal Server Error`: Rendering-Fehler

---

### **Dynamic Data API**

#### **GET /api/fluid/data/{tableName}/{uid}**

Lädt einen Datensatz aus der TYPO3-Datenbank.

**Parameters:**
- `tableName` (string): Tabellenname (allowlist: `tt_content`, `pages`, `sys_file`, `sys_file_reference`)
- `uid` (integer): Eindeutige ID des Datensatzes

**Example Request:**
```bash
GET /api/fluid/data/tt_content/123
```

**Response (Success):**
```javascript
{
  "uid": 123,
  "pid": 1,
  "header": "My Content Element",
  "bodytext": "<p>Content goes here</p>",
  "CType": "textmedia",
  "colPos": 0,
  "sorting": 256,
  "tstamp": 1672531200,
  "crdate": 1672527600,
  "cruser_id": 1,
  "hidden": 0,
  "deleted": 0
}
```

**Response (Error):**
```javascript
{
  "error": "Record not found",
  "code": "RECORD_NOT_FOUND",
  "table": "tt_content",
  "uid": 999
}
```

**Security Restrictions:**
- Nur im `Development` Context verfügbar
- Auf erlaubte Tabellen beschränkt
- Keine sensitive Daten (Passwörter, etc.)

---

## 🔧 **PHP API Classes**

### **ExtensionConfiguration**

Zentrale Konfigurationsklasse für alle Extension-Einstellungen.

```php
namespace Vendor\FluidStorybook\Configuration;

class ExtensionConfiguration
{
    /**
     * Get configuration value with environment variable support
     */
    public static function get(string $key, mixed $default = null): mixed
    
    /**
     * Get all CORS allowed origins as array
     */
    public static function getCorsAllowedOrigins(): array
    
    /**
     * Check if performance monitoring is enabled
     */
    public static function isPerformanceMonitoringEnabled(): bool
    
    /**
     * Get cache lifetime in seconds
     */
    public static function getCacheLifetime(): int
}
```

**Beispiel-Verwendung:**
```php
// Get API endpoint URL
$apiEndpoint = ExtensionConfiguration::get('api_render_endpoint');

// Get CORS origins
$allowedOrigins = ExtensionConfiguration::getCorsAllowedOrigins();

// Check monitoring status
if (ExtensionConfiguration::isPerformanceMonitoringEnabled()) {
    // Enable detailed logging
}
```

---

### **FluidRenderApiController**

Hauptcontroller für Fluid Template Rendering.

```php
namespace Vendor\FluidStorybook\Controller;

class FluidRenderApiController extends ActionController
{
    /**
     * Render Fluid template with variables
     */
    public function renderAction(): ResponseInterface
    
    /**
     * Get template manifest (all available templates)
     */
    public function manifestAction(): ResponseInterface
    
    /**
     * Health check endpoint
     */
    public function healthAction(): ResponseInterface
}
```

---

### **DataApiController**

Controller für dynamische Datenabfragen.

```php
namespace Vendor\FluidStorybook\Controller;

class DataApiController extends ActionController
{
    /**
     * Fetch single record by table and UID
     */
    public function recordAction(string $tableName, int $uid): ResponseInterface
    
    /**
     * List available tables
     */
    public function tablesAction(): ResponseInterface
}
```

---

### **SecurityMiddleware**

Middleware für CORS und Rate Limiting.

```php
namespace Vendor\FluidStorybook\Middleware;

class SecurityMiddleware implements MiddlewareInterface
{
    /**
     * Process request with security checks
     */
    public function process(
        ServerRequestInterface $request, 
        RequestHandlerInterface $handler
    ): ResponseInterface
}
```

**Features:**
- CORS Header Management
- Rate Limiting per IP
- Request Validation
- Security Logging

---

### **CacheOptimizationService**

Service für intelligente Cache-Verwaltung.

```php
namespace Vendor\FluidStorybook\Service;

class CacheOptimizationService
{
    /**
     * Get optimized cache lifetime based on environment
     */
    public function getOptimizedCacheLifetime(): int
    
    /**
     * Check if cache should be bypassed
     */
    public function shouldBypassCache(array $variables): bool
    
    /**
     * Clean expired cache entries
     */
    public function cleanExpiredEntries(): int
    
    /**
     * Get cache statistics
     */
    public function getCacheStatistics(): array
}
```

---

## 📱 **JavaScript/TypeScript API**

### **FluidTemplate Function**

Hauptfunktion für Template-Rendering in Storybook.

```typescript
interface FluidTemplateOptions {
  templatePath: string;
  variables?: Record<string, any>;
  cacheLifetime?: number;
  timeout?: number;
}

interface FluidTemplateResponse {
  html: string;
  cached: boolean;
  renderTime: number;
}

/**
 * Render Fluid template via API
 */
async function FluidTemplate(options: FluidTemplateOptions): Promise<string>
```

**Beispiel-Verwendung:**
```javascript
// Basic usage
const html = await FluidTemplate({
  templatePath: 'EXT:my_ext/Resources/Private/Templates/Component.html',
  variables: { title: 'Hello World' }
});

// With advanced options
const html = await FluidTemplate({
  templatePath: 'EXT:my_ext/Resources/Private/Templates/Component.html',
  variables: { title: 'Hello World' },
  cacheLifetime: 3600,
  timeout: 10000
});
```

---

### **FluidStorybookConfig Class**

Konfigurationsmanagement für JavaScript.

```typescript
class FluidStorybookConfig {
  /**
   * Get configuration value
   */
  static get(key: string, defaultValue?: any): any
  
  /**
   * Get all configuration
   */
  static getAll(): Record<string, any>
  
  /**
   * Detect current environment
   */
  static detectEnvironment(): 'development' | 'ddev' | 'production' | 'storybook'
  
  /**
   * Get API base URL for current environment
   */
  static getApiBaseUrl(): string
  
  /**
   * Check if debug mode is enabled
   */
  static isDebugMode(): boolean
}
```

**Beispiel-Verwendung:**
```javascript
// Get API configuration
const apiUrl = FluidStorybookConfig.getApiBaseUrl();
const timeout = FluidStorybookConfig.get('api_timeout', 5000);

// Environment detection
const env = FluidStorybookConfig.detectEnvironment();
if (env === 'development') {
  console.log('Development mode active');
}
```

---

### **fetchTypo3Record Function**

Funktion zum Laden von TYPO3-Datensätzen.

```typescript
interface Typo3Record {
  uid: number;
  pid: number;
  [key: string]: any;
}

/**
 * Fetch single record from TYPO3 database
 */
async function fetchTypo3Record(tableName: string, uid: number): Promise<Typo3Record>
```

**Beispiel-Verwendung:**
```javascript
// Load content element
const contentElement = await fetchTypo3Record('tt_content', 123);

// Use in Storybook story
export const WithRealData = Template.bind({});
WithRealData.loaders = [
  async () => {
    const record = await fetchTypo3Record('tt_content', 123);
    return { contentData: record };
  }
];
```

---

## 🛠️ **CLI Commands**

### **storybook:generate-manifest**

Generiert ein Manifest aller verfügbaren Fluid Templates.

```bash
./vendor/bin/typo3 storybook:generate-manifest [options]
```

**Optionen:**
- `--extensions=ext1,ext2`: Nur spezifische Extensions scannen
- `--output=path/to/manifest.json`: Output-Pfad für Manifest
- `--include-system`: System-Extensions einschließen
- `--format=json|yaml`: Output-Format

**Beispiele:**
```bash
# Alle Extensions scannen
./vendor/bin/typo3 storybook:generate-manifest

# Nur spezifische Extensions
./vendor/bin/typo3 storybook:generate-manifest --extensions=my_sitepackage,news

# Custom output path
./vendor/bin/typo3 storybook:generate-manifest --output=Resources/Public/Storybook/custom-manifest.json
```

**Manifest Format:**
```json
{
  "version": "1.0.0",
  "generated": "2023-12-01T10:30:00Z",
  "extensions": {
    "my_extension": {
      "templates": [
        {
          "path": "EXT:my_extension/Resources/Private/Templates/Component.html",
          "name": "Component",
          "relativePath": "Component.html",
          "size": 1024,
          "modified": "2023-11-30T15:20:00Z"
        }
      ],
      "partials": [...],
      "layouts": [...]
    }
  }
}
```

---

## 🔐 **Security API**

### **Rate Limiting**

```http
# Rate limit headers in responses
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1672531200
X-RateLimit-Window: 900
```

### **CORS Headers**

```http
# CORS headers for cross-origin requests
Access-Control-Allow-Origin: http://localhost:6006
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

### **Security Headers**

```http
# Security headers added by middleware
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 📊 **Performance Monitoring API**

### **Performance Metrics**

Verfügbare Metriken wenn Performance Monitoring aktiviert ist:

```javascript
// Performance data structure
interface PerformanceMetrics {
  renderTime: number;          // Template render time in ms
  cacheHitRate: number;        // Cache hit percentage
  memoryUsage: number;         // Memory usage in bytes
  requestCount: number;        // Total requests processed
  errorRate: number;           // Error percentage
  averageResponseTime: number; // Average response time
}
```

### **Health Check Endpoint**

```http
GET /api/fluid/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-01T10:30:00Z",
  "version": "1.2.3",
  "environment": "Development",
  "services": {
    "database": "connected",
    "cache": "operational",
    "filesystem": "accessible"
  },
  "metrics": {
    "uptime": 86400,
    "requestCount": 1500,
    "errorCount": 5,
    "cacheHitRate": 85.2
  }
}
```

---

## 📝 **Error Codes Reference**

### **Template Errors**
- `TEMPLATE_NOT_FOUND`: Template-Datei nicht gefunden
- `TEMPLATE_SYNTAX_ERROR`: Fluid-Syntax-Fehler im Template
- `TEMPLATE_PERMISSION_DENIED`: Fehlende Berechtigungen für Template-Datei

### **API Errors**
- `INVALID_PARAMETERS`: Ungültige Request-Parameter
- `RATE_LIMIT_EXCEEDED`: Rate Limit überschritten
- `CORS_ORIGIN_NOT_ALLOWED`: CORS-Origin nicht erlaubt
- `DEVELOPMENT_CONTEXT_REQUIRED`: Development Context erforderlich

### **Data Errors**
- `RECORD_NOT_FOUND`: Datensatz nicht gefunden
- `TABLE_NOT_ALLOWED`: Tabelle nicht in Allowlist
- `DATABASE_CONNECTION_FAILED`: Datenbankverbindung fehlgeschlagen

### **Cache Errors**
- `CACHE_WRITE_FAILED`: Cache konnte nicht geschrieben werden
- `CACHE_READ_FAILED`: Cache konnte nicht gelesen werden
- `CACHE_CLEANUP_FAILED`: Cache-Bereinigung fehlgeschlagen

---

## 🔧 **Environment Variables Reference**

Vollständige Liste aller verfügbaren Umgebungsvariablen:

```bash
# Extension Core
FLUID_STORYBOOK_EXTENSION_KEY=fluid_storybook
FLUID_STORYBOOK_CACHE_IDENTIFIER=fluid_storybook_renderresults

# API Configuration  
FLUID_STORYBOOK_API_BASE_PATH=/api/fluid
FLUID_STORYBOOK_API_RENDER_ENDPOINT=/api/fluid/render
FLUID_STORYBOOK_API_DATA_ENDPOINT=/api/fluid/data
FLUID_STORYBOOK_API_TIMEOUT=10000

# URLs
FLUID_STORYBOOK_TYPO3_BASE_URL=http://localhost
FLUID_STORYBOOK_STORYBOOK_BASE_URL=http://localhost:6006
FLUID_STORYBOOK_STORYBOOK_STATIC_URL=http://localhost:6007

# Security
FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS=100
FLUID_STORYBOOK_RATE_LIMIT_WINDOW_MINUTES=15
FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS=http://localhost:6006,http://localhost:6007

# Performance
FLUID_STORYBOOK_CACHE_LIFETIME=3600
FLUID_STORYBOOK_PERFORMANCE_MONITORING=true

# Debug
FLUID_STORYBOOK_DEBUG_MODE=false
FLUID_STORYBOOK_LOG_LEVEL=info
```

---

## 📚 **Integration Examples**

### **Storybook Story mit API**

```javascript
// Component.stories.js
export default {
  title: 'Components/MyComponent',
  argTypes: {
    title: { control: 'text' },
    items: { control: 'object' }
  }
};

const Template = (args) => {
  const container = document.createElement('div');
  
  FluidTemplate({
    templatePath: 'EXT:my_ext/Resources/Private/Templates/Component.html',
    variables: args
  })
  .then(html => container.innerHTML = html)
  .catch(error => container.innerHTML = `<p>Error: ${error.message}</p>`);
  
  return container;
};

export const Default = Template.bind({});
Default.args = {
  title: 'Hello World',
  items: ['Item 1', 'Item 2', 'Item 3']
};
```

### **Custom Hook für React-ähnliche Stories**

```javascript
// useFluidTemplate.js
function useFluidTemplate(templatePath, variables) {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    FluidTemplate({ templatePath, variables })
      .then(result => {
        setHtml(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [templatePath, JSON.stringify(variables)]);
  
  return { html, loading, error };
}
```

**Diese API-Referenz wird kontinuierlich erweitert und aktualisiert, um alle Features und Änderungen der Extension abzudecken.** 
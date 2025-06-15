// Resources/Public/JavaScript/FluidTemplate.ts

/**
 * Represents a structured error object returned by FluidTemplate on failure.
 */
export interface FluidTemplateError {
  /** A human-readable summary of the error. */
  message: string;
  /** Categorizes the error (e.g., ConfigurationError, APIError, NetworkError). */
  type: "ConfigurationError" | "APIError" | "NetworkError";
  /** The HTTP status code returned by the API, if applicable. */
  status?: number;
  /** More specific information or details about the error. */
  details?: string;
}

/**
 * Defines the options for the {@link FluidTemplate} function.
 */
export interface FluidTemplateOptions {
  /**
   * The path to the Fluid template to render. Must use the `EXT:` convention.
   * @example "EXT:my_extension/Resources/Private/Templates/MyComponent.html"
   */
  templatePath: string;
  /**
   * An object of variables to pass to the Fluid template.
   * These variables will be available in the Fluid template's context.
   * @default {}
   * @example { headline: "Hello", items: [{id:1, name:"A"}] }
   */
  variables?: Record<string, any>;
  /**
   * The API endpoint URL that handles Fluid template rendering.
   * @default "/api/fluid/render"
   */
  apiEndpoint?: string;
  /**
   * Whether to enable client-side caching for this request.
   * @default true
   */
  enableCache?: boolean;
  /**
   * Cache timeout in milliseconds.
   * @default 300000 (5 minutes)
   */
  cacheTimeout?: number;
  /**
   * AbortController signal for request cancellation.
   */
  signal?: AbortSignal;
}

// Client-side cache implementation
class FluidTemplateCache {
  private cache = new Map<string, { data: string; timestamp: number; timeout: number }>();

  set(key: string, data: string, timeout: number): void {
    this.cache.set(key, { data, timestamp: Date.now(), timeout });
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.timeout) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance
const templateCache = new FluidTemplateCache();

// Debouncing for rapid successive calls
const pendingRequests = new Map<string, Promise<string>>();

/**
 * Fetches and renders a Fluid template from a TYPO3 API endpoint.
 *
 * This function communicates with a TYPO3 backend to render a specified Fluid template,
 * passing variables and returning the rendered HTML. It's designed for use in
 * Storybook to preview TYPO3 Fluid components.
 *
 * @async
 * @param {FluidTemplateOptions} options - The options for rendering the template.
 * @returns {Promise<string>} A promise that resolves with the rendered HTML string.
 * @throws {FluidTemplateError} Rejects with a structured error object if rendering fails or parameters are invalid.
 *
 * @example
 * ```typescript
 * FluidTemplate({
 *   templatePath: "EXT:my_ext/Resources/Private/Templates/MyComponent.html",
 *   variables: { title: "My Component" }
 * })
 * .then(html => console.log(html))
 * .catch(error => console.error(error.message, error.details));
 * ```
 */
// Import configuration (CommonJS for Jest compatibility)
const FluidStorybookConfig = require('./config.ts');

export async function FluidTemplate({
  templatePath,
  variables = {},
  apiEndpoint = FluidStorybookConfig.getApiEndpoint() // Use configuration default
}: FluidTemplateOptions): Promise<string> {
  if (!templatePath) {
    const error: FluidTemplateError = {
      message: "FluidTemplate Error: 'templatePath' is required.",
      type: "ConfigurationError",
      details: "The 'templatePath' parameter was not provided to the FluidTemplate function."
    };
    if (FluidStorybookConfig.shouldLogToConsole()) {
      console.error(error.message, error.details);
    }
    return Promise.reject(error);
  }

  try {
    // Ensure variables is always an object, never null or undefined
    const safeVariables = variables || {};
    
    const params = new URLSearchParams();
    params.append('templatePath', templatePath);
    params.append('variables', JSON.stringify(safeVariables));

    const fetchUrl = `${apiEndpoint}?${params.toString()}`;
    // console.log(`FluidTemplate: Fetching from ${fetchUrl}`); // Optional: for debugging

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
      }
    });

    if (!response.ok) {
      let errorDetails = `Status: ${response.status} ${response.statusText}. URL: ${response.url}`;
      let apiErrorJson;
      try {
        apiErrorJson = await response.json();
        if (apiErrorJson && apiErrorJson.error) {
          errorDetails = apiErrorJson.error;
          if (apiErrorJson.details) {
             errorDetails += ` Details: ${apiErrorJson.details}`;
          }
        } else {
          // Attempt to get text if JSON parsing failed or didn't yield expected structure
          const textResponse = await response.text();
          errorDetails = textResponse || errorDetails; // Use text if available, else original details
        }
      } catch (e) {
        // Parsing response.json() failed or response.text() failed after that
        if (FluidStorybookConfig.shouldLogToConsole()) {
          console.warn('FluidTemplate: Could not parse error response body as JSON.', e);
        }
        try {
             // Try to get text response directly if JSON parsing was the issue
             const textResponse = await response.text();
             errorDetails = textResponse || `Status: ${response.status} ${response.statusText}. URL: ${response.url}`; // Fallback if text() also empty
        } catch (textErr) {
             // If response.text() also fails, stick with the original errorDetails
             if (FluidStorybookConfig.shouldLogToConsole()) {
               console.warn('FluidTemplate: Could not parse error response body as text either.', textErr);
             }
        }
      }

      const error: FluidTemplateError = {
        message: `FluidTemplate Error: API request failed for template '${templatePath}'.`,
        type: "APIError",
        status: response.status,
        details: errorDetails
      };
      if (FluidStorybookConfig.shouldLogToConsole()) {
        console.error(error.message, `Status: ${error.status}`, `Details: ${error.details}`);
      }
      return Promise.reject(error);
    }

    const renderedHtml = await response.text();
    // Optional: Warn if response is OK but content is empty and seems like JSON
    if (renderedHtml.trim() === '' && response.headers.get('Content-Type')?.includes('application/json')) {
         if (FluidStorybookConfig.shouldLogToConsole()) {
           console.warn(`FluidTemplate: Received empty response for template '${templatePath}', but status was OK. Check API and template.`);
         }
    }
    return renderedHtml;

  } catch (networkError: unknown) { // Catch as 'unknown' for type safety
    const error: FluidTemplateError = {
      message: `FluidTemplate Error: Network error while trying to fetch template '${templatePath}'.`,
      type: "NetworkError",
      details: (networkError instanceof Error ? networkError.message : String(networkError)) || "Could not connect to the API endpoint."
    };
    if (FluidStorybookConfig.shouldLogToConsole()) {
      console.error(error.message, `Original error:`, networkError);
    }
    return Promise.reject(error);
  }
}

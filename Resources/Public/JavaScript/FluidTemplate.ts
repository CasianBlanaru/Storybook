// Resources/Public/JavaScript/FluidTemplate.ts

export interface FluidTemplateError {
  message: string;
  type: "ConfigurationError" | "APIError" | "NetworkError";
  status?: number; // HTTP status code, optional
  details?: string; // Detailed error information, optional
}

export interface FluidTemplateOptions {
  templatePath: string;
  variables?: Record<string, any>; // Allows any structure for variables
  apiEndpoint?: string;
}

/**
 * Fetches and renders a Fluid template from a TYPO3 API endpoint.
 *
 * @param {FluidTemplateOptions} options - The options for rendering the template.
 * @returns {Promise<string>} A promise that resolves with the rendered HTML string or rejects with a structured error object.
 */
export async function FluidTemplate({
  templatePath,
  variables = {},
  apiEndpoint = '/api/fluid/render' // Default API endpoint
}: FluidTemplateOptions): Promise<string> {
  if (!templatePath) {
    const error: FluidTemplateError = {
      message: "FluidTemplate Error: 'templatePath' is required.",
      type: "ConfigurationError",
      details: "The 'templatePath' parameter was not provided to the FluidTemplate function."
    };
    console.error(error.message, error.details);
    return Promise.reject(error);
  }

  try {
    const params = new URLSearchParams();
    params.append('templatePath', templatePath);
    params.append('variables', JSON.stringify(variables));

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
          const textResponse = await response.text();
          errorDetails = textResponse || errorDetails;
        }
      } catch (e) {
        console.warn('FluidTemplate: Could not parse error response body.', e);
        try {
             const textResponse = await response.text();
             errorDetails = textResponse || `Status: ${response.status} ${response.statusText}. URL: ${response.url}`;
        } catch (textErr) {
             // fallback to original
        }
      }

      const error: FluidTemplateError = {
        message: `FluidTemplate Error: API request failed for template '${templatePath}'.`,
        type: "APIError",
        status: response.status,
        details: errorDetails
      };
      console.error(error.message, `Status: ${error.status}`, `Details: ${error.details}`);
      return Promise.reject(error);
    }

    const renderedHtml = await response.text();
    // Optional: Warn if response is OK but content is empty and seems like JSON
    if (renderedHtml.trim() === '' && response.headers.get('Content-Type')?.includes('application/json')) {
         console.warn(`FluidTemplate: Received empty response for template '${templatePath}', but status was OK. Check API and template.`);
    }
    return renderedHtml;

  } catch (networkError: any) { // Catch as 'any' for broader compatibility with error types
    const error: FluidTemplateError = {
      message: `FluidTemplate Error: Network error while trying to fetch template '${templatePath}'.`,
      type: "NetworkError",
      details: networkError.message || "Could not connect to the API endpoint."
    };
    console.error(error.message, `Original error: ${networkError.message}`);
    return Promise.reject(error);
  }
}

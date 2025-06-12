/**
 * Fetches and renders a Fluid template from a TYPO3 API endpoint.
 *
 * @param {string} templatePath The path to the Fluid template (e.g., 'EXT:my_extension/Resources/Private/Templates/MyTemplate.html').
 * @param {object} [variables={}] Optional key-value pairs of variables to pass to the Fluid template.
 * @param {string} [apiEndpoint='/api/fluid/render'] The API endpoint URL.
 * @returns {Promise<string>} A promise that resolves with the rendered HTML string or a structured error object.
 */
async function FluidTemplate({ templatePath, variables = {}, apiEndpoint = '/api/fluid/render' }) {
  if (!templatePath) {
    const error = {
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
    console.log(`FluidTemplate: Fetching from ${fetchUrl}`); // Log the URL being fetched

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest', // Common header for AJAX requests
      }
    });

    if (!response.ok) {
      let errorDetails = `Status: ${response.status} ${response.statusText}. URL: ${response.url}`;
      let apiErrorJson;
      try {
        // Try to parse the response body as JSON, as our API controller sends JSON errors
        apiErrorJson = await response.json();
        if (apiErrorJson && apiErrorJson.error) {
          errorDetails = apiErrorJson.error; // Main error message from API
          if (apiErrorJson.details) { // Additional details from API
             errorDetails += ` Details: ${apiErrorJson.details}`;
          }
        } else {
          // If not JSON or not the expected structure, fall back to text
          const textResponse = await response.text();
          errorDetails = textResponse || errorDetails;
        }
      } catch (e) {
        // If parsing response body fails, use the initial errorDetails
        console.warn('FluidTemplate: Could not parse error response body.', e);
        // Try to get text response as fallback if JSON parsing failed
        try {
             const textResponse = await response.text(); // re-await text if json failed.
             errorDetails = textResponse || `Status: ${response.status} ${response.statusText}. URL: ${response.url}`;
        } catch (textErr) {
             // Stick with original if text response also fails
        }
      }

      const error = {
        message: `FluidTemplate Error: API request failed for template '${templatePath}'.`,
        type: "APIError",
        status: response.status,
        details: errorDetails
      };
      console.error(error.message, `Status: ${error.status}`, `Details: ${error.details}`);
      return Promise.reject(error);
    }

    const renderedHtml = await response.text();
    if (renderedHtml.trim() === '' && response.headers.get('Content-Type')?.includes('application/json')) {
         // This might indicate an issue where the API returned an empty JSON response instead of HTML
         // or if the template genuinely rendered empty but was served with wrong content type.
         // For now, we assume empty HTML is valid if status is OK.
         // If API contract changes to send JSON on success (not current plan), this needs adjustment.
         console.warn(`FluidTemplate: Received empty response for template '${templatePath}', but status was OK. Check API and template.`);
    }
    return renderedHtml;

  } catch (networkError) {
    // This catches network errors (e.g., DNS resolution, server unreachable)
    const error = {
      message: `FluidTemplate Error: Network error while trying to fetch template '${templatePath}'.`,
      type: "NetworkError",
      details: networkError.message || "Could not connect to the API endpoint."
    };
    console.error(error.message, `Original error: ${networkError.message}`);
    return Promise.reject(error);
  }
}

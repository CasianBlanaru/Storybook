// Resources/Public/JavaScript/Typo3Data.ts

/**
 * Represents the expected structure of a successful or error response
 * from the TYPO3 data API endpoint.
 */
export interface FetchTypo3RecordResponse {
  /** The fetched record data. Present on success. */
  record?: any; // Consider defining a more specific type if possible, e.g., Record<string, any>
  /** Error message if the API request failed. */
  error?: string;
  /** The table from which the record was requested, present in some error responses. */
  table?: string;
  /** The UID of the requested record, present in some error responses. */
  uid?: number;
}

/**
 * Fetches a single record from a specified TYPO3 table by its UID.
 * Accesses the `/api/fluid/data/{tableName}/{uid}` endpoint.
 *
 * **Note:** This function and its corresponding API endpoint are intended for
 * use in a **Development context ONLY** due to security considerations of
 * exposing raw database data.
 *
 * @async
 * @param {string} tableName - The name of the TYPO3 table (e.g., "tt_content", "pages").
 *                           Must be one of the tables allowed by the backend API.
 * @param {number} uid - The UID of the record to fetch.
 * @returns {Promise<any>} A promise that resolves with the record data (typically an object).
 * @throws {Error} If the fetch operation fails, the API returns an error,
 *                 or the response structure is unexpected.
 *
 * @example
 * ```typescript
 * fetchTypo3Record('tt_content', 123)
 *   .then(record => console.log('Fetched tt_content record:', record))
 *   .catch(error => console.error('Failed to fetch record:', error.message));
 * ```
 */
export async function fetchTypo3Record(tableName: string, uid: number): Promise<any> {
  if (!tableName || typeof tableName !== 'string') {
    return Promise.reject(new Error('tableName must be a non-empty string.'));
  }
  if (typeof uid !== 'number' || uid <= 0) {
    return Promise.reject(new Error('uid must be a positive number.'));
  }

  const apiEndpoint = `/api/fluid/data/${encodeURIComponent(tableName)}/${uid}`;

  try {
    const response = await fetch(apiEndpoint);

    if (!response.ok) {
      let errorDetails = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorData: FetchTypo3RecordResponse = await response.json();
        errorDetails = errorData.error || errorDetails; // Use API error message if available
      } catch (e) {
        // Could not parse JSON, stick with HTTP status
      }
      throw new Error(`Failed to fetch TYPO3 record from '${apiEndpoint}'. Details: ${errorDetails}`);
    }

    const data: FetchTypo3RecordResponse = await response.json();

    if (data.error) {
      // This case might occur if response.ok is true but API still returns JSON with an error field (unlikely with current backend)
      throw new Error(`API error for ${tableName} UID ${uid}: ${data.error}`);
    }
    if (!data.hasOwnProperty('record')) {
        // If 'record' property is missing, even on success, it's an unexpected response.
        throw new Error(`API response for ${tableName} UID ${uid} is missing 'record' field.`);
    }
    return data.record;

  } catch (networkError: unknown) { // Catch as 'unknown' for type safety
    const errorMessage = `Network or unexpected error in fetchTypo3Record for '${apiEndpoint}'. Details: ${
        (networkError instanceof Error ? networkError.message : String(networkError))
    }`;
    console.error(errorMessage, networkError);
    // Re-throw with a more specific error message if preferred, or just re-throw original
    throw new Error(errorMessage);
  }
}

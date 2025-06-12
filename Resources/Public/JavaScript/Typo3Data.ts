// Resources/Public/JavaScript/Typo3Data.ts

export interface FetchTypo3RecordResponse {
  record?: any; // Define a more specific type if possible based on expected records
  error?: string;
  table?: string;
  uid?: number;
}

/**
 * Fetches a single record from a specified TYPO3 table by its UID.
 * Accesses the `/api/fluid/data/{tableName}/{uid}` endpoint.
 *
 * @param {string} tableName - The name of the TYPO3 table (e.g., "tt_content", "pages").
 * @param {number} uid - The UID of the record to fetch.
 * @returns {Promise<any>} A promise that resolves with the record data.
 * @throws {Error} If the fetch operation fails or the API returns an error.
 */
export async function fetchTypo3Record(tableName: string, uid: number): Promise<any> {
  const apiEndpoint = `/api/fluid/data/${encodeURIComponent(tableName)}/${uid}`;

  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      const errorData: FetchTypo3RecordResponse = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to fetch TYPO3 record: ${response.status} ${response.statusText}. ` +
        (errorData.error ? `Error: ${errorData.error}` : 'Could not retrieve error details.')
      );
    }
    const data: FetchTypo3RecordResponse = await response.json();
    if (data.error) {
        throw new Error(`API returned an error for ${tableName} UID ${uid}: ${data.error}`);
    }
    return data.record;
  } catch (error) {
    console.error('Error in fetchTypo3Record:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
}

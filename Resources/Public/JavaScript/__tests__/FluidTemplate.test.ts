// Resources/Public/JavaScript/__tests__/FluidTemplate.test.ts
import { FluidTemplate, FluidTemplateError, FluidTemplateOptions } from '../FluidTemplate';

describe('FluidTemplate', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const mockApiEndpoint = '/test-api/fluid/render';

  it('should fetch and return HTML content on successful API response', async () => {
    const mockHtml = '<h1>Test HTML</h1>';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => mockHtml,
      headers: new Headers({'Content-Type': 'text/html'})
    } as Response);

    const options: FluidTemplateOptions = {
      templatePath: 'EXT:my_ext/Resources/Private/Templates/Test.html',
      apiEndpoint: mockApiEndpoint
    };
    const html = await FluidTemplate(options);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      `${mockApiEndpoint}?templatePath=${encodeURIComponent(options.templatePath)}&variables=%7B%7D`, // {} for empty variables
      expect.any(Object)
    );
    expect(html).toBe(mockHtml);
  });

  it('should return a structured APIError on API error response (e.g., 404)', async () => {
    const errorResponse = { error: 'Template not found', details: 'Path invalid' };
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => errorResponse,
      text: async () => JSON.stringify(errorResponse), // Fallback if json() parsing fails in FluidTemplate
      url: 'http://localhost' + mockApiEndpoint + '/somepath'
    } as Response);

    const options: FluidTemplateOptions = {
      templatePath: 'EXT:my_ext/Resources/Private/Templates/NotFound.html',
      apiEndpoint: mockApiEndpoint
    };

    try {
      await FluidTemplate(options);
    } catch (e) {
      const error = e as FluidTemplateError;
      expect(error.type).toBe('APIError');
      expect(error.status).toBe(404);
      expect(error.message).toContain('API request failed');
      expect(error.details).toBe(`${errorResponse.error} Details: ${errorResponse.details}`);
    }
  });

  it('should handle API error response that is not JSON', async () => {
     const errorText = 'Server Error Occurred';
     mockFetch.mockResolvedValueOnce({
       ok: false,
       status: 500,
       statusText: 'Internal Server Error',
       json: async () => { throw new Error("Not JSON"); }, // Simulate json parsing failure
       text: async () => errorText,
       url: 'http://localhost' + mockApiEndpoint + '/servererror'
     } as Partial<Response> as Response);

     const options: FluidTemplateOptions = {
         templatePath: 'EXT:my_ext/Resources/Private/Templates/ServerError.html',
         apiEndpoint: mockApiEndpoint
     };

     try {
         await FluidTemplate(options);
     } catch (e) {
         const error = e as FluidTemplateError;
         expect(error.type).toBe('APIError');
         expect(error.status).toBe(500);
         expect(error.details).toBe(errorText);
     }
 });

  it('should return a structured NetworkError on fetch network failure', async () => {
    const networkErrorMessage = 'Failed to fetch';
    mockFetch.mockRejectedValueOnce(new Error(networkErrorMessage));

    const options: FluidTemplateOptions = {
      templatePath: 'EXT:my_ext/Resources/Private/Templates/NetworkError.html',
      apiEndpoint: mockApiEndpoint
    };

    try {
      await FluidTemplate(options);
    } catch (e) {
      const error = e as FluidTemplateError;
      expect(error.type).toBe('NetworkError');
      expect(error.message).toContain('Network error');
      expect(error.details).toBe(networkErrorMessage);
    }
  });

  it('should return a structured ConfigurationError if templatePath is missing', async () => {
    // @ts-ignore to test invalid input for templatePath
    const options: FluidTemplateOptions = { templatePath: undefined, apiEndpoint: mockApiEndpoint };
    try {
      await FluidTemplate(options);
    } catch (e) {
      const error = e as FluidTemplateError;
      expect(error.type).toBe('ConfigurationError');
      expect(error.message).toContain("'templatePath' is required");
    }
  });

  it('should correctly encode variables in the fetch URL', async () => {
     mockFetch.mockResolvedValueOnce({
         ok: true,
         text: async () => '<div></div>',
         headers: new Headers({'Content-Type': 'text/html'})
     } as Response);

     const options: FluidTemplateOptions = {
         templatePath: 'EXT:my_ext/Resources/Private/Templates/WithVars.html',
         variables: { key1: 'value 1', key2: { nested: 'valü&' } },
         apiEndpoint: mockApiEndpoint
     };

     await FluidTemplate(options);

     // Get the actual call to verify the encoding
     const actualCall = mockFetch.mock.calls[0][0] as string;
     expect(actualCall).toContain(encodeURIComponent(options.templatePath));
     expect(actualCall).toContain(encodeURIComponent(JSON.stringify(options.variables)));
     expect(mockFetch).toHaveBeenCalledTimes(1);
 });
});

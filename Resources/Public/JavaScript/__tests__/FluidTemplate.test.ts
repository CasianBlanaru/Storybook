// Resources/Public/JavaScript/__tests__/FluidTemplate.test.ts
import { FluidTemplate, FluidTemplateError, FluidTemplateOptions } from '../FluidTemplate';

// Mock global fetch
global.fetch = jest.fn();
// Mock console.warn for one test
global.console.warn = jest.fn();


describe('FluidTemplate', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    (global.console.warn as jest.Mock).mockClear(); // Clear console.warn mock
  });

  const mockApiEndpoint = '/test-api/fluid/render';

  // ... (existing test cases remain here) ...

  it('should fetch and return HTML content on successful API response', async () => {
     const mockHtml = '<h1>Test HTML</h1>';
     (global.fetch as jest.Mock).mockResolvedValueOnce({
       ok: true,
       text: async () => mockHtml,
       headers: new Headers({'Content-Type': 'text/html'})
     });
     const options: FluidTemplateOptions = {
       templatePath: 'EXT:my_ext/Resources/Private/Templates/Test.html',
       apiEndpoint: mockApiEndpoint
     };
     const html = await FluidTemplate(options);
     expect(global.fetch).toHaveBeenCalledTimes(1);
     expect(html).toBe(mockHtml);
  });

  it('should return a structured APIError on API error response (e.g., 404)', async () => {
     const errorResponse = { error: 'Template not found', details: 'Path invalid' };
     (global.fetch as jest.Mock).mockResolvedValueOnce({
       ok: false,
       status: 404,
       statusText: 'Not Found',
       json: async () => errorResponse,
       text: async () => JSON.stringify(errorResponse),
       url: 'http://localhost' + mockApiEndpoint + '/somepath'
     });
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
     }
  });

  it('should handle API error response that is not JSON', async () => {
     const errorText = 'Server Error Occurred';
     (global.fetch as jest.Mock).mockResolvedValueOnce({
       ok: false,
       status: 500,
       statusText: 'Internal Server Error',
       json: async () => { throw new Error("Not JSON"); },
       text: async () => errorText,
       url: 'http://localhost' + mockApiEndpoint + '/servererror'
     });
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
     (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(networkErrorMessage));
     const options: FluidTemplateOptions = {
       templatePath: 'EXT:my_ext/Resources/Private/Templates/NetworkError.html',
       apiEndpoint: mockApiEndpoint
     };
     try {
       await FluidTemplate(options);
     } catch (e) {
       const error = e as FluidTemplateError;
       expect(error.type).toBe('NetworkError');
       expect(error.details).toBe(networkErrorMessage);
     }
  });

  it('should return a structured ConfigurationError if templatePath is missing', async () => {
     // @ts-ignore to test invalid input for templatePath
     const options: FluidTemplateOptions = { templatePath: undefined as any, apiEndpoint: mockApiEndpoint };
     try {
       await FluidTemplate(options);
     } catch (e) {
       const error = e as FluidTemplateError;
       expect(error.type).toBe('ConfigurationError');
     }
  });

  it('should correctly encode variables in the fetch URL', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          text: async () => '<div></div>',
          headers: new Headers({'Content-Type': 'text/html'})
      });

      const options: FluidTemplateOptions = {
          templatePath: 'EXT:my_ext/Resources/Private/Templates/WithVars.html',
          variables: { key1: 'value 1', key2: { nested: 'valü&' } },
          apiEndpoint: mockApiEndpoint
      };
      await FluidTemplate(options);
      
      // Check that fetch was called with the correct parameters
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const actualCall = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(actualCall).toContain(encodeURIComponent(options.templatePath));
      expect(actualCall).toContain('variables=');
      // Variables should be properly JSON encoded
      const variablesMatch = actualCall.match(/variables=([^&]+)/);
      expect(variablesMatch).toBeTruthy();
      if (variablesMatch) {
        const decodedVariables = decodeURIComponent(variablesMatch[1]);
        expect(JSON.parse(decodedVariables)).toEqual(options.variables);
      }
  });

 // New Test Case 1 (Adjusted): API returns 200 OK with application/json AND EMPTY BODY
 it('should warn if API returns 200 OK with application/json and empty body', async () => {
     (global.fetch as jest.Mock).mockResolvedValueOnce({
       ok: true,
       status: 200,
       text: async () => '', // Empty body
       headers: new Headers({ 'Content-Type': 'application/json; charset=utf-8' })
     });

     const templatePath = 'EXT:my_ext/Resources/Private/Templates/EmptyJsonReturn.html';
     const options: FluidTemplateOptions = { templatePath, apiEndpoint: mockApiEndpoint };
     const result = await FluidTemplate(options);

     expect(result).toBe(''); // Should return the empty body
     expect(global.console.warn).toHaveBeenCalledTimes(1);
     expect(global.console.warn).toHaveBeenCalledWith(
       `FluidTemplate: Received empty response for template '${templatePath}', but status was OK. Check API and template.`
     );
 });


 // New Test Case 2: `variables` is null or undefined
 it('should default to empty object if variables is null', async () => {
     (global.fetch as jest.Mock).mockResolvedValueOnce({
       ok: true,
       text: async () => '<div></div>',
       headers: new Headers({'Content-Type': 'text/html'})
     });

     const options: FluidTemplateOptions = {
       templatePath: 'EXT:my_ext/Resources/Private/Templates/NullVars.html',
       variables: null as any, // Test with null
       apiEndpoint: mockApiEndpoint
     };
     await FluidTemplate(options);

     expect(global.fetch).toHaveBeenCalledWith(
       `${mockApiEndpoint}?templatePath=${encodeURIComponent(options.templatePath)}&variables=%7B%7D`, // %7B%7D is {}
       expect.any(Object)
     );
 });

 it('should default to empty object if variables is undefined', async () => {
     (global.fetch as jest.Mock).mockResolvedValueOnce({
       ok: true,
       text: async () => '<div></div>',
       headers: new Headers({'Content-Type': 'text/html'})
     });

     const options: FluidTemplateOptions = {
       templatePath: 'EXT:my_ext/Resources/Private/Templates/UndefinedVars.html',
       variables: undefined, // Test with undefined (default parameter handles this)
       apiEndpoint: mockApiEndpoint
     };
     await FluidTemplate(options);

     expect(global.fetch).toHaveBeenCalledWith(
       `${mockApiEndpoint}?templatePath=${encodeURIComponent(options.templatePath)}&variables=%7B%7D`,
       expect.any(Object)
     );
 });

});

# TYPO3 Fluid Storybook Integration

This project allows developers to render and interact with TYPO3 Fluid templates directly within a Storybook environment. This facilitates component-driven development and testing for TYPO3 frontends.

## Project Purpose

- To enable isolated development and testing of Fluid templates.
- To provide a living style guide for TYPO3 frontend components.
- To improve collaboration between designers and developers.
- To leverage Storybook's rich ecosystem of addons and tools for UI development.

## Current Status: Alpha

This integration is in its early stages of development (Alpha). Core functionality for rendering templates is available, but many features and improvements are still planned.

## Dependencies

- **TYPO3:** ^12.4
- **Node.js:** ^18.x || ^20.x (or newer LTS versions)
- **Storybook:** ^8.x (as per the `package.json` setup)
- **PHP:** ^8.1 (compatible with TYPO3 12.4)

## Getting Started

### 1. Install the TYPO3 Extension

1.  **Download/Clone:** Place this extension (`my_fluid_storybook`) into your TYPO3 project's `packages/` directory (or `typo3conf/ext/` for older non-composer setups, though composer is highly recommended).
    ```bash
    # Example for composer-based TYPO3 projects
    cd /path/to/your/typo3project/
    # Assuming you have the extension source code available:
    cp -r /path/to/my_fluid_storybook packages/
    ```
2.  **Activate:** In the TYPO3 backend, go to "Admin Tools" > "Extensions" and activate the "Fluid Storybook Integration" extension (key: `my_fluid_storybook`).
    *This step ensures the API endpoint is registered.*

### 2. Set Up and Run Storybook

The Storybook setup is located within the extension at `Resources/Public/Storybook/`.

1.  **Navigate to the Storybook directory:**
    ```bash
    cd /path/to/your/typo3project/packages/my_fluid_storybook/Resources/Public/Storybook/
    ```
2.  **Install Node.js dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Run Storybook:**
    ```bash
    npm run storybook
    # or
    # yarn storybook
    ```
    This will typically open Storybook in your browser at `http://localhost:6006`.

## How to Use: `FluidTemplate` Function

The core of this integration is the `FluidTemplate` JavaScript function. You use this function within your Storybook stories to render Fluid templates.

### `FluidTemplate` API

The `FluidTemplate` function is the primary way to render your Fluid templates in Storybook. It's an asynchronous JavaScript function that fetches rendered HTML from your TYPO3 instance.

```javascript
async function FluidTemplate({ templatePath, variables = {}, apiEndpoint = '/api/fluid/render' })
```

**Parameters:**

-   **`templatePath`** (string, required)
    -   **Convention**: This path *must* follow the TYPO3 `EXT:` convention, pointing to a Fluid template file. Examples:
        -   `EXT:my_extension/Resources/Private/Templates/MyComponent.html`
        -   `EXT:my_extension/Resources/Private/Partials/SomePartial.html`
        -   `EXT:my_extension/Resources/Private/Layouts/DefaultLayout.html`
    -   **File Types**: Typically points to `.html` files. Other extensions might work if your Fluid configuration supports them, but `.html` is standard.
    -   **Case Sensitivity**: File paths can be case-sensitive, especially on Linux servers. Ensure the case matches the actual file system path.
    -   **Validation**: The backend performs a basic validation to ensure the path starts with `EXT:` and does not contain `../` for security reasons.

-   **`variables`** (object, optional)
    -   **Purpose**: An object where keys are variable names and values are the data you want to pass to your Fluid template.
    -   **Structure**: You can pass strings, numbers, booleans, arrays, and nested objects. These are assigned to the Fluid `StandaloneView` using `assignMultiple()`. For example:
        ```javascript
        variables: {
          headline: "Welcome!",
          user: { name: "John Doe", age: 30 },
          items: ["Apple", "Banana", "Cherry"],
          settings: { showImage: true }
        }
        ```
        In Fluid, you'd access these as `{headline}`, `{user.name}`, `{items}`, etc.
    -   **Default**: `{}` (no variables passed).

-   **`apiEndpoint`** (string, optional)
    -   **Purpose**: The URL of the TYPO3 API endpoint that handles the rendering request.
    -   **Default**: `'/api/fluid/render'`
    -   **When to change**: You typically don't need to change this unless:
        -   You've customized the route for the `FluidRenderApiController` in your TYPO3 site configuration.
        -   You are proxying requests or have a different base path for your TYPO3 API.
        -   Storybook is running on a completely different domain than TYPO3 and requires a full URL (e.g., `https://your-typo3-site.com/api/fluid/render`). *Note: Cross-domain requests will require proper CORS headers to be configured on the TYPO3 server side.*

**Returns:**

-   **`Promise<string | object>`**:
    -   **On Success**: Resolves with a string containing the rendered HTML from the Fluid template.
    -   **On Failure**: Rejects with a structured error object (see "Understanding Error Objects" below).

**Interaction with TYPO3 Fluid:**

-   The backend API endpoint (`FluidRenderApiController`) uses TYPO3's `TYPO3\CMS\Fluid\View\StandaloneView` to render your templates.
-   This means the rendering happens within a TYPO3 context, allowing access to TYPO3's core functionalities and any globally available ViewHelpers.
-   However, `StandaloneView` does not have the full context of a typical TYPO3 frontend page request (e.g., no fully initialized `TypoScriptFrontendController` (TSFE), page data, or extbase plugin context by default). Variables and settings normally available through TypoScript or page context might need to be explicitly passed via the `variables` parameter if your template relies on them.

### Understanding Error Objects

When the `FluidTemplate` promise is rejected, it returns a structured error object to help you diagnose the issue. This object typically contains the following fields:

-   **`message`** (string): A human-readable summary of the error. This is the main message to display.
    -   *Example: "FluidTemplate Error: API request failed for template 'EXT:my_ext/...'."*
-   **`type`** (string): Categorizes the error. Common types include:
    -   `ConfigurationError`: An issue with the parameters passed to `FluidTemplate` (e.g., missing `templatePath`).
    -   `APIError`: The TYPO3 API endpoint responded with an error (e.g., template not found, server-side rendering error).
    -   `NetworkError`: A problem occurred with the network request itself (e.g., TYPO3 server unreachable, DNS issue, CORS problem).
-   **`status`** (number, optional): The HTTP status code returned by the API. Only present for `APIError` types.
    -   *Examples: `400` (Bad Request), `404` (Not Found), `500` (Internal Server Error).*
-   **`details`** (string, optional): More specific information about the error.
    -   For `APIError`, this may contain the error message or details returned by the TYPO3 backend (e.g., "Template file not found or not readable at: ...", or a snippet of a server-side exception message).
    -   For `NetworkError`, this might be the browser's native error message (e.g., "Failed to fetch").
    -   For `ConfigurationError`, it explains the configuration problem.

Inspecting these fields, especially `type`, `status`, and `details`, can greatly help in pinpointing the cause of a rendering failure. The browser's developer console will also show these details when an error is logged.

### Example Story (`*.stories.js`)

Here's how you might use it in a story file (e.g., `SimpleFluidTemplate.stories.js`):

### More Complex Example

Let's consider a Fluid template that uses conditions, loops, and renders a partial.

**Fluid Template (`EXT:my_fluid_storybook/Resources/Private/Templates/ComplexStory.html`):**

```html
<div style="border: 2px solid green; padding: 15px;">
    <h2>{mainHeadline}</h2>

    <f:if condition="{showExtraInfo}">
        <p style="background-color: #f0f0f0; padding: 8px;">
            Extra Information is visible! Some text: {extraInfoText}
        </p>
    </f:if>

    <f:if condition="{items}">
        <h3>Items List:</h3>
        <ul>
            <f:for each="{items}" as="item" iteration="itemIterator">
                <li>
                    {item.name} (ID: {item.id})
                    <f:render partial="SimpleInfoPartial" arguments="{info: item.description, iteration: itemIterator}" />
                </li>
            </f:for>
        </ul>
    </f:if>

    <f:if condition="!{items}">
        <p>No items provided.</p>
    </f:if>
</div>
```

**Fluid Partial (`EXT:my_fluid_storybook/Resources/Private/Partials/SimpleInfoPartial.html`):**

```html
<div style="border: 1px dashed blue; padding: 10px; margin-top: 5px;">
    <p>This is a partial: <strong>{info}</strong></p>
    <p>Current item (if in loop): {iteration.index}</p>
</div>
```
*Note: For the `<f:render partial="SimpleInfoPartial" ... />` to work, your TYPO3 `StandaloneView` setup (which is handled by the API controller) must be able to resolve partials. Typically, this means the partial `SimpleInfoPartial.html` should be in a recognized `Partials` directory (e.g., `Resources/Private/Partials/` within the same extension, or other configured partial paths in your TYPO3 setup).*

**Storybook Story (`ComplexExample.stories.js`):**

```javascript
// Assumes FluidTemplate is globally available or imported

export default {
  title: 'TYPO3 Fluid/Complex Example',
  argTypes: {
    mainHeadline: { control: 'text' },
    showExtraInfo: { control: 'boolean' },
    extraInfoText: { control: 'text' },
    items: { control: 'object' }, // Allows editing JSON for the items array
    templatePath: { control: 'text' },
  },
};

const Template = (args) => {
  const container = document.createElement('div');
  const { templatePath, ...variables } = args; // Separate templatePath from other variables

  FluidTemplate({ templatePath, variables })
    .then(html => {
      container.innerHTML = html;
    })
    .catch(error => {
      // Using the enhanced error display from previous examples
      let errorMessage = 'An unexpected error occurred.';
      if (typeof error === 'string') { /* ... (error handling as before) ... */ }
      else if (error && error.message) {
         errorMessage = `<strong>${error.message}</strong>`;
         if (error.type) errorMessage += `<br>Type: ${error.type}`;
         if (error.status) errorMessage += `<br>Status: ${error.status}`;
         if (error.details) errorMessage += `<br>Details: <pre>${error.details}</pre>`;
      }
      container.innerHTML = `<div style="color: red; border: 1px solid red; padding: 10px; font-family: monospace;">${errorMessage}</div>`;
    });
  return container;
};

export const DefaultView = Template.bind({});
DefaultView.args = {
  templatePath: 'EXT:my_fluid_storybook/Resources/Private/Templates/ComplexStory.html',
  mainHeadline: 'Complex Template Demo',
  showExtraInfo: true,
  extraInfoText: 'This information is shown based on a condition.',
  items: [
    { id: 1, name: 'Item Alpha', description: 'First item details' },
    { id: 2, name: 'Item Beta', description: 'Second item details' },
    { id: 3, name: 'Item Gamma', description: 'Third item details' },
  ],
};

export const NoItemsAndNoExtraInfo = Template.bind({});
NoItemsAndNoExtraInfo.args = {
  templatePath: 'EXT:my_fluid_storybook/Resources/Private/Templates/ComplexStory.html',
  mainHeadline: 'Minimal View',
  showExtraInfo: false,
  extraInfoText: 'This should not be visible.',
  items: [],
};
```
This example demonstrates how to pass more complex data (arrays of objects) and how boolean flags can control conditional rendering within your Fluid template, all testable from Storybook. The use of `<f:render partial="..." />` also shows how TYPO3's Fluid engine handles partial inclusion automatically, provided the partials are discoverable by your TYPO3 setup.

```javascript
// Assumes FluidTemplate is globally available (loaded via .storybook/preview-head.html)
// or imported if set up as a module.

export default {
  title: 'TYPO3 Fluid/My Component',
  argTypes: {
    headline: { control: 'text' },
    content: { control: 'text' },
    // It's good practice to make the templatePath configurable for testing different templates
    templatePath: { control: 'text', defaultValue: 'EXT:my_extension_key/Resources/Private/Templates/MyComponent.html' },
  },
};

const Template = ({ templatePath, headline, content, ...args }) => {
  const container = document.createElement('div');

  FluidTemplate({ templatePath, variables: { headline, content } })
    .then(html => {
      container.innerHTML = html;
    })
    .catch(error => {
      // Display the error nicely in Storybook
      container.innerHTML = `<div style="color: red; border: 1px solid red; padding: 10px;">
                               <strong>Error rendering template:</strong>
                               <pre>${typeof error === 'string' ? error : error.message}</pre>
                             </div>`;
    });
  return container; // Storybook renders this div, which gets updated asynchronously
};

export const ExampleComponent = Template.bind({});
ExampleComponent.args = {
  headline: 'Dynamic Headline from Storybook',
  content: 'This is some dynamic content passed as a variable.',
  templatePath: 'EXT:my_fluid_storybook/Resources/Private/Templates/SimpleStory.html', // Example path
};
```

### Example Fluid Template (`SimpleStory.html`)

```html
<!-- EXT:my_fluid_storybook/Resources/Private/Templates/SimpleStory.html -->
<div style="border: 1px solid #ccc; padding: 10px; margin: 10px;">
    <h1>{headline}</h1>
    <p>{content}</p>
    <p>This is a simple Fluid template rendered for Storybook.</p>
</div>
```

## Troubleshooting Common Errors

Refer to the "Understanding Error Objects" section for details on `type`, `status`, and `details` fields mentioned below.

-   **Template Not Found or Access Issues**
    -   **Symptoms in Storybook**: Error message like "FluidTemplate Error: API request failed..."
    -   **Error Object Clues**:
        -   `type`: `APIError`
        -   `status`: `404` (Not Found) or `400` (Bad Request if path is malformed) or `500` (if server-side check fails unexpectedly, e.g. permission issues miscategorized by a generic handler)
        -   `details`: Often contains messages like "Template file not found or not readable at: EXT:..." or "Invalid 'templatePath'. Must start with EXT:..."
    -   **Possible Causes**:
        -   The `templatePath` in your story is incorrect (typo, wrong extension key, incorrect path within `Resources/Private/...`).
        -   The Fluid template file does not exist at the specified location on the server.
        -   File permissions on the server prevent the template from being read by the web server user.
        -   The `templatePath` format is invalid (e.g., doesn't start with `EXT:`, contains `../`).
    -   **Solutions**:
        -   Carefully verify the `templatePath` in your Storybook story against the actual file path in your TYPO3 extension. Remember case sensitivity on some systems.
        -   Ensure the template file is present on the server and has correct read permissions for the web server user.
        -   Check the `details` field in the error object (visible in Storybook error display or browser console) for the exact message from the TYPO3 API.

-   **Server-Side Rendering Errors in Fluid**
    -   **Symptoms in Storybook**: Generic API error message like "FluidTemplate Error: API request failed...".
    -   **Error Object Clues**:
        -   `type`: `APIError`
        -   `status`: `500` (Internal Server Error)
        -   `details`: Might contain (part of) the PHP exception message from Fluid (e.g., "Unknown view helper...", "Call to undefined method...", "Too few arguments to function..."). This is crucial for debugging.
    -   **Possible Causes**:
        -   Syntax errors in your Fluid template (e.g., mismatched tags, incorrect ViewHelper arguments).
        -   Calling a ViewHelper that is not registered or available in `StandaloneView` context.
        -   Attempting to access variables that were not passed or are `null` without proper checks (e.g., `{object.property}` where `object` is null).
        -   PHP errors within custom ViewHelpers.
    -   **Solutions**:
        -   Examine the `details` field of the error object closely. This often provides the direct PHP error message.
        -   Check your TYPO3 server logs (e.g., `var/log/` or configured log output) for more extensive backtraces or related errors.
        -   Simplify your Fluid template. Comment out sections or ViewHelpers until the error disappears to isolate the problematic part.
        -   Ensure all variables used in the template are correctly passed from your Storybook story via the `variables` parameter, or that your Fluid logic gracefully handles optional/missing variables (e.g., using `<f:if condition="{variable}">`).
        -   Verify that any custom ViewHelpers are correctly implemented and registered for use in a `StandaloneView` context if necessary.

-   **Network/Connectivity Issues**
    -   **Symptoms in Storybook**: Messages like "FluidTemplate Error: Network error...", "Failed to fetch", or the component area might hang or show a very generic browser error.
    -   **Error Object Clues**:
        -   `type`: `NetworkError`
        -   `status`: Will be absent or not applicable.
        -   `details`: Might contain browser-specific network messages like "Failed to fetch", "ERR_CONNECTION_REFUSED", "ERR_NAME_NOT_RESOLVED", or similar.
    -   **Possible Causes**:
        -   Your local TYPO3 development site is not running or is not accessible at the host/port Storybook is trying to reach.
        -   The API endpoint (`/api/fluid/render`) is not correctly registered:
            -   The `my_fluid_storybook` extension might not be active in TYPO3.
            -   There might be an issue with TYPO3's routing configuration or URL rewriting.
        -   Cross-Origin Resource Sharing (CORS) issues if Storybook (e.g., `http://localhost:6006`) and TYPO3 (e.g., `http://localhost:80` or `http://my-project.ddev.site`) are on different origins.
        -   A firewall or browser extension (like an ad blocker or privacy tool) is blocking the request.
        -   DNS resolution problems if using a hostname for the API.
    -   **Solutions**:
        -   Ensure your TYPO3 local development site is running and accessible from your browser at the address configured or implied by `apiEndpoint`.
        -   Verify the `my_fluid_storybook` extension is activated in TYPO3's Extension Manager.
        -   Open your browser's developer tools (usually F12), go to the "Network" tab, and re-trigger the template rendering in Storybook. Inspect the failed request (often highlighted in red). Check its URL, headers, and any specific error code or message provided by the browser.
        -   If CORS is suspected (check the browser console for CORS-related errors), ensure your TYPO3 server sends appropriate `Access-Control-Allow-Origin` headers for the Storybook origin. For local development, allowing `http://localhost:6006` (or your Storybook port) might be necessary.
        -   Temporarily disable browser extensions that might interfere with network requests to rule them out.
        -   Ensure the `apiEndpoint` in `FluidTemplate` (if overridden) or its default `/api/fluid/render` correctly resolves to your TYPO3 instance.

-   **`FluidTemplate` Function Not Loaded (Client-Side)**
    -   **Symptoms in Storybook**: A JavaScript error directly in the browser console, like "`ReferenceError: FluidTemplate is not defined`", or the custom message: "Error: FluidTemplate function is not loaded." This error appears in the Storybook UI component itself.
    -   **Error Object Clues**: This is a client-side JavaScript runtime error, not a structured error object from the `FluidTemplate` promise. The error will be visible in the browser's developer console.
    -   **Possible Causes**:
        -   The `FluidTemplate.js` (or `.ts`) script is not being loaded into the Storybook preview iframe.
    -   **Solutions**:
        -   Verify the `staticDirs` configuration in `.storybook/main.js`. It should correctly point to the directory containing `FluidTemplate.js` relative to the `.storybook` directory (e.g., `['../../JavaScript']` if `FluidTemplate.js` is in `Resources/Public/JavaScript/`).
        -   If using `.storybook/preview-head.html` to load the script, double-check the `<script src="/FluidTemplate.js"></script>` tag. The path should be absolute from the Storybook root (e.g., `/FluidTemplate.js` if `JavaScript` is correctly mapped to the root via `staticDirs`).
        -   If you've transitioned `FluidTemplate.js` to be an ES module and are importing it (e.g., in `preview.js` or directly in stories), ensure the import path is correct and Storybook's build process (Webpack/Vite) is correctly resolving and bundling the module.

-   **Invalid JSON in `variables` Parameter**
    -   **Symptoms in Storybook**: API error.
    -   **Error Object Clues (from server-side JSON parsing)**:
        -   `type`: `APIError`
        -   `status`: `400` (Bad Request)
        -   `details`: Likely contains the message "Invalid JSON in 'variables' parameter." from `FluidRenderApiController.php`.
    -   **Possible Causes**:
        -   The `variables` object passed to `FluidTemplate` in a story is not a valid JavaScript object that can be successfully serialized by `JSON.stringify()` and then deserialized by PHP's `json_decode()`. This is rare for typical data but can occur with complex objects containing circular references, functions, or unsupported types if not handled carefully.
    -   **Solutions**:
        -   Ensure the `variables` object in your story contains only data types compatible with JSON (strings, numbers, booleans, arrays, plain objects).
        -   Avoid circular references within the `variables` object.
        -   Check the browser's developer console; `FluidTemplate.js` logs the URL it's fetching, including the `variables` JSON string. You can inspect this string for obvious issues.

## Contributing

Details on contributing will be added later. For now, feel free to raise issues or suggest improvements.

## License

(To be determined - likely MIT or GPLv2+, common for TYPO3 extensions)
```

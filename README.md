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

- **`FluidTemplate({ templatePath, variables = {}, apiEndpoint = '/api/fluid/render' })`**
  - **`templatePath`** (string, required): The path to the Fluid template you want to render. This path uses the `EXT:` prefix, e.g., `EXT:my_fluid_storybook/Resources/Private/Templates/SimpleStory.html`.
  - **`variables`** (object, optional): A key-value object of variables to pass to the Fluid template. These variables will be available in your Fluid template. Defaults to `{}`.
  - **`apiEndpoint`** (string, optional): The URL of the TYPO3 API endpoint that handles rendering. Defaults to `/api/fluid/render`. You usually don't need to change this unless you have a custom setup.
  - **Returns**: `Promise<string>` - A promise that resolves with the rendered HTML string from TYPO3, or rejects with an error message.

### Example Story (`*.stories.js`)

Here's how you might use it in a story file (e.g., `SimpleFluidTemplate.stories.js`):

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

- **`Failed to render Fluid template: ... API Error (404): ...` or `Template file not found...`**:
  - **Cause**: The `templatePath` specified in your story is incorrect, or the template file does not exist at that location on the server.
  - **Solution**: Double-check the `templatePath`. Ensure it starts with `EXT:your_extension_key/` and correctly points to a `.html` file within the `Resources/Private/Templates/` (or Partials/Layouts) directory of the specified extension. Verify the file exists on the server.

- **`Failed to render Fluid template: ... API Error (500): ...` or `Failed to render Fluid template. Reason: ...`**:
  - **Cause**: A server-side error occurred in TYPO3 while trying to render the template. This could be due to errors within the Fluid template itself (e.g., calling a non-existent ViewHelper), issues with the API controller, or incorrect variables. The `details` part of the error (if provided by the API) might give more clues.
  - **Solution**: Check the TYPO3 logs for more detailed error messages. Simplify your Fluid template to isolate the issue. Ensure all ViewHelpers are correctly registered and used.

- **`Failed to render Fluid template: ... Reason: Failed to fetch` or `NetworkError`**:
  - **Cause**: Storybook (running in the browser) cannot reach the TYPO3 API endpoint (`/api/fluid/render`). This could be because:
    - TYPO3 site is not running or accessible from your browser.
    - The API endpoint is not correctly registered (e.g., extension not active, routing issue).
    - A Content Security Policy (CSP) issue.
    - Cross-Origin Resource Sharing (CORS) issue if Storybook and TYPO3 are on different domains/ports (less common for this integrated setup but possible).
  - **Solution**:
    - Ensure your TYPO3 local development site is running.
    - Verify the `my_fluid_storybook` extension is activated in TYPO3.
    - Open your browser's developer tools (Network tab) to inspect the failed request to `/api/fluid/render`. Check the response and status code.
    - Ensure the API endpoint path in `FluidTemplate.js` matches the one defined in `Configuration/Routes/Api.yaml`.

- **`FluidTemplate function is not loaded` (error shown in Storybook component area)**:
   - **Cause**: The `FluidTemplate.js` script was not loaded correctly in the Storybook preview iframe.
   - **Solution**:
       - Check `.storybook/main.js` for the `staticDirs: ['../../JavaScript']` configuration. This should point to the directory containing `FluidTemplate.js` relative to the `.storybook` folder.
       - Check `.storybook/preview-head.html` to ensure `<script src="/FluidTemplate.js"></script>` is present. The path `/FluidTemplate.js` assumes the script is served at the root of the Storybook static server due to the `staticDirs` setting.

## Contributing

Details on contributing will be added later. For now, feel free to raise issues or suggest improvements.

## License

(To be determined - likely MIT or GPLv2+, common for TYPO3 extensions)
```

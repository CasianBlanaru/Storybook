# Advanced Recipes & Practical Guides

This document provides practical recipes and guides for leveraging the features of the `my_fluid_storybook` integration to achieve common development tasks.

## Recipe 1: Story for a `tt_content` Element with Live TYPO3 Data

This recipe shows how to create a Storybook story that fetches data for a specific `tt_content` element from your TYPO3 database and renders it using its Fluid template.

**Prerequisites:**
- The Dynamic Data API endpoint must be enabled and working (see `Documentation/DynamicData.md`).
- You have a Fluid template suitable for rendering the `tt_content` type you want to preview (e.g., `CeTextMedia.html`).
- You know the UID of the `tt_content` element you want to fetch.

**Steps:**

1.  **Ensure `fetchTypo3Record` is available to your stories:**
    As configured in `preview.js`, `fetchTypo3Record` should be available on `window.fetchTypo3Record`.

2.  **Create your story file (e.g., `MyTextMedia.stories.js`):**
    ```javascript
    // MyTextMedia.stories.js
    // Assuming fetchTypo3Record and FluidTemplate are globally available (e.g., on window)

    export default {
      title: 'TYPO3 Content Elements/TextMedia (Live Data)',
      tags: ['autodocs'],
      argTypes: {
        contentElementUid: { control: 'number', name: 'Content Element UID' },
        // You might add more argTypes here if the template needs other variables not from the record
      },
    };

    const Template = (args, { loaded }) => {
      const container = document.createElement('div');

      if (loaded && loaded.fetchError) {
        container.innerHTML = `<p style="color:red;">Error fetching data: ${loaded.fetchError}</p>`;
        return container;
      }
      if (!loaded || !loaded.contentElementData) {
        container.innerHTML = args.contentElementUid > 0 ? '<p>Loading content element data...</p>' : '<p>Enter a UID to load data.</p>';
        return container;
      }

      window.FluidTemplate({
        templatePath: 'EXT:my_sitepackage/Resources/Private/Templates/ContentElements/TextMedia.html', // Adjust to your CE template path
        variables: {
          // Pass the entire record, or specific fields as needed by your template
          data: loaded.contentElementData, // TYPO3 CE templates often expect data in {data.field_name}
          // or record: loaded.contentElementData, // if your template uses {record.field_name}
        }
      })
      .then(html => { container.innerHTML = html; })
      .catch(renderError => {
        container.innerHTML = `<p style="color:red;">Render error: ${renderError.message}</p>`;
      });

      return container;
    };

    export const LiveTextMedia = Template.bind({});
    LiveTextMedia.args = {
      contentElementUid: 1, // Replace with a valid UID from your TYPO3 tt_content table
    };

    LiveTextMedia.loaders = [
      async (context) => {
        const uid = context.args.contentElementUid;
        if (!uid || uid <= 0) {
          return { contentElementData: null };
        }
        try {
          const record = await window.fetchTypo3Record('tt_content', uid);
          return { contentElementData: record };
        } catch (error) {
          console.error("Failed to load tt_content record:", error);
          return { fetchError: error.message || 'Unknown error' };
        }
      },
    ];
    ```

3.  **Adapt your Fluid template (`TextMedia.html`):**
    Ensure your template expects variables in the way you pass them (e.g., `{data.header}`, `{data.bodytext}`).

---

## Recipe 2: Making Fluid Components Themeable in Storybook

Leverage the basic theming setup (see `Documentation/Theming.md`) to make your components switch between light/dark (or other) themes.

**Prerequisites:**
- Theming (CSS custom properties + Storybook toolbar) is configured as per `Documentation/Theming.md`.

**Steps:**

1.  **Design your Fluid template's CSS with CSS Custom Properties:**
    ```css
    /* In your extension's main CSS file */
    :root { /* Light theme (default) */
      --my-component-bg: #ffffff;
      --my-component-text: #333333;
      --my-component-border: 1px solid #cccccc;
    }

    [data-theme="dark"] { /* Dark theme overrides */
      --my-component-bg: #2a2a2a;
      --my-component-text: #eeeeee;
      --my-component-border: 1px solid #555555;
    }

    .my-custom-themable-component {
      background-color: var(--my-component-bg);
      color: var(--my-component-text);
      border: var(--my-component-border);
      padding: 1rem;
      transition: background-color 0.3s, color 0.3s;
    }
    ```

2.  **Use the class in your Fluid template:**
    ```html
    <!-- EXT:my_sitepackage/Resources/Private/Templates/MyThemableComponent.html -->
    <div class="my-custom-themable-component">
        <h3>{headline}</h3>
        <p>This component's styles adapt to the selected theme.</p>
    </div>
    ```

3.  **Create a story for it:**
    The story itself doesn't need special theme arguments if the theme switcher is global.
    ```javascript
    // MyThemableComponent.stories.js
    export default {
      title: 'Components/My Themable Component',
      argTypes: { headline: { control: 'text'} }
    };
    // ... (Standard Template rendering logic) ...
    export const Default = Template.bind({});
    Default.args = {
      templatePath: 'EXT:my_sitepackage/Resources/Private/Templates/MyThemableComponent.html',
      headline: 'I change with themes!'
    };
    ```
    Now, using the theme switcher in the Storybook toolbar will change the `data-theme` attribute on `document.documentElement`, and your component's CSS will adapt.

---

## Recipe 3: Logging Interactions with Storybook Actions

Capture DOM events from your rendered Fluid template and log them in the Storybook Actions panel.

**Prerequisites:**
- `@storybook/addon-actions` is available (part of `@storybook/addon-essentials`).

**Steps:**

1.  **Identify interactive elements in your Fluid template:**
    Give them a unique ID or class.
    ```html
    <!-- EXT:my_sitepackage/Resources/Private/Templates/InteractiveCard.html -->
    <div class="interactive-card">
        <h4>{title}</h4>
        <button type="button" id="card-learn-more-{uniqueId}">Learn More</button>
    </div>
    ```

2.  **Define actions in your story's `argTypes`:**
    ```javascript
    // InteractiveCard.stories.js
    export default {
      title: 'Components/Interactive Card',
      argTypes: {
        title: { control: 'text' },
        uniqueId: { control: 'text', defaultValue: '1' }, // To make button ID unique if multiple cards
        onLearnMoreClick: { action: 'learnMoreClicked', description: 'Card Learn More button clicked' }
      }
    };
    ```

3.  **Attach event listeners in the story's render logic:**
    ```javascript
    const Template = (args) => {
      const container = document.createElement('div');
      // ... (FluidTemplate call) ...
      window.FluidTemplate({ /* ... */ })
        .then(html => {
          container.innerHTML = html;
          const buttonId = `card-learn-more-${args.uniqueId}`;
          const button = container.querySelector(`#${buttonId}`);
          if (button) {
            button.addEventListener('click', (event) => {
              args.onLearnMoreClick({ cardTitle: args.title, buttonId });
            });
          }
        })
        // ... (catch errors) ...
      return container;
    };
    // ... (bind story) ...
    ```
    When the "Learn More" button is clicked, the `onLearnMoreClick` action (provided by Storybook via `argTypes`) is called, and the event + payload appears in the Actions panel.

---

## Recipe 4: Using the 'Manifest Driven Story'

Quickly preview any template listed in your `template-manifest.json`.

**Prerequisites:**
   - You have run the CLI command in your TYPO3 project:
     ```bash
     ./vendor/bin/typo3 storybook:generate-manifest
     ```
- Storybook has been restarted or refreshed since the manifest was generated/updated.

**Steps:**

1.  **Navigate to the story**: Find the "TYPO3 Fluid > Manifest Driven Story" in your Storybook sidebar.
2.  **Select a template**: Use the "Select Template (from Manifest)" dropdown. This lists templates found by the CLI command.
3.  **Provide variables**: Use the "Variables" JSON object control to input any data the selected template might need (e.g., `{"headline": "My Test", "bodytext": "<p>Content here.</p>"}`).
4.  **Observe**: The story will attempt to render the chosen template with the variables you provided.

**Tips:**
   - If the template list is empty or outdated, re-run the CLI command as shown above and refresh Storybook.
- The `variables` control is generic. You'll need to know what variables your selected template expects.

---

## Recipe 5: Debugging Common Rendering Issues

Troubleshooting tips when your Fluid template doesn't render as expected in Storybook.

1.  **Check Storybook Error Display**:
    -   The area where the component renders often shows a red box with error details from `FluidTemplate.ts` (e.g., `APIError`, `NetworkError`). Note the `type`, `status`, and `details`.

2.  **Browser Developer Console**:
    -   Open your browser's dev tools (usually F12).
    -   **Console Tab**: Look for detailed JavaScript errors from `FluidTemplate.ts` or other Storybook processes.
    -   **Network Tab**:
        -   Filter for requests to `/api/fluid/render` (or your data API endpoint).
        -   Check the request URL, parameters (templatePath, variables).
        -   Inspect the Response:
            -   If status is 404 (Not Found): Double-check `templatePath`.
            -   If status is 500 (Server Error): The response body (if JSON) might contain the PHP error message from TYPO3.
            -   If status is 400 (Bad Request): Problem with `templatePath` format or `variables` JSON.
            -   If status is 403 (Forbidden): API disabled (e.g. Data API not in Dev context).
        -   Check `X-FluidStorybook-Cache` header to see if response was cached.

3.  **TYPO3 Server Logs**:
    -   Check `var/log/` in your TYPO3 project for detailed PHP errors if the API returns a 500 error. This is often the most informative for Fluid rendering issues (e.g., ViewHelper errors, syntax errors in Fluid).

4.  **Simplify**:
    -   **Template**: Reduce your Fluid template to the simplest possible version to isolate the problematic part.
    -   **Variables**: Start with an empty `variables: {}` object in your story, then add variables back one by one.
    -   **ViewHelpers**: If you suspect a ViewHelper, try removing it or replacing it with static content temporarily.

5.  **Verify `templatePath`**:
    -   Ensure it's exactly `EXT:extension_key/Resources/Private/Templates/MyTemplate.html` (or Partials/Layouts). Case sensitivity matters on some systems.

6.  **Test API Directly**:
    -   Construct the API URL (e.g., `http://your-site.ddev.site/api/fluid/render?templatePath=EXT:my_ext/...&variables={...}`) and try opening it directly in your browser or using a tool like Postman/curl to see the raw response. Remember to URL-encode parameters.

---
*(More recipes can be added as new features or common patterns emerge.)*

# Dynamic Data from TYPO3 in Storybook

This document describes a feature for fetching live data from your TYPO3 database to use in Storybook previews, making them more realistic.

**Caution: This feature, especially the provided API endpoint, is intended for `Development` context usage ONLY due to security considerations. Do not enable or expose it in production environments without thorough security hardening.**

## Feature Overview

1.  **TYPO3 API Endpoint (`/api/fluid/data/{tableName}/{uid}`)**:
    -   A controller (`DataApiController`) handles requests to this endpoint.
    -   It fetches a single database record by its table name and UID.
    -   **Security**:
        -   Only active if `TYPO3_CONTEXT` is 'Development'.
        -   Restricted to a predefined allowlist of table names (e.g., `tt_content`, `pages`).
        -   Requires numeric UID.
    -   Returns the record as JSON or an error message.

2.  **JavaScript Helper (`fetchTypo3Record`)**:
    -   Located in `Resources/Public/JavaScript/Typo3Data.ts`.
    -   A function that simplifies calling the API endpoint from your Storybook stories.
    -   Handles the `fetch` call and basic error reporting.

3.  **Storybook Integration (Loader Pattern)**:
    -   Stories can use the `fetchTypo3Record` helper within Storybook's [loader pattern](https://storybook.js.org/docs/react/writing-stories/loaders) to fetch data asynchronously before the story renders.
    -   The fetched data can then be passed as `variables` to the `FluidTemplate` function.

## How to Use

### 1. Ensure API is Active
-   Your TYPO3 application context must be set to `Development`. You can typically set this in your `.env` file: `TYPO3_CONTEXT=Development`.

### 2. Update `.storybook/preview.js`
-   Make sure `fetchTypo3Record` from `Typo3Data.ts` is imported and made available (e.g., globally on `window` or through Storybook's context).
    ```javascript
    // .storybook/preview.js
    import { fetchTypo3Record } from '../../JavaScript/Typo3Data.ts';
    // @ts-ignore
    window.fetchTypo3Record = fetchTypo3Record;
    ```

### 3. Create a Story
```javascript
// YourStory.stories.js
// Assuming fetchTypo3Record is globally available on window

export default {
  title: 'My Component with DB Data',
  argTypes: { uid: { control: 'number' } },
};

const Template = (args, { loaded }) => {
  const container = document.createElement('div');
  if (loaded.error) {
    container.innerHTML = `<p style="color:red;">Error loading data: ${loaded.error}</p>`;
    return container;
  }
  if (!loaded.recordData) {
    container.innerHTML = '<p>Loading or no data...</p>';
    return container;
  }

  // Assuming FluidTemplate is also global or imported
  window.FluidTemplate({
    templatePath: 'EXT:my_ext/Resources/Private/Templates/MyTemplate.html',
    variables: { record: loaded.recordData }
  })
  .then(html => container.innerHTML = html)
  .catch(err => container.innerHTML = `<p style="color:red;">Render error: ${err.message}</p>`);

  return container;
};

export const MyLiveExample = Template.bind({});
MyLiveExample.args = {
  uid: 123, // UID of a tt_content record
};
MyLiveExample.loaders = [
  async (context) => {
    const { uid } = context.args;
    if (!uid || uid <= 0) return { recordData: null };
    try {
      const record = await window.fetchTypo3Record('tt_content', uid);
      return { recordData: record };
    } catch (error) {
      return { error: error.message || 'Failed to load record' };
    }
  },
];
```

### 4. Example Fluid Template (`MyTemplate.html`)
```html
<!-- Expects {record} variable containing fields from tt_content -->
<div>
    <f:if condition="{record.header}">
        <h1>{record.header}</h1>
    </f:if>
    <f:format.html>{record.bodytext}</f:format.html>
</div>
```

## Security Considerations & Limitations (IMPORTANT)

-   **Development Only**: The provided `DataApiController` is explicitly restricted to `Development` context. **Do not remove this check or use in production without significant hardening.**
-   **Table Allowlist**: The controller uses a hardcoded allowlist of tables. Be very cautious if you extend this.
-   **Data Exposure**: This API directly exposes raw database records. Ensure that no sensitive data could be inadvertently exposed, even in development.
-   **Performance**: Direct database queries per story can be slow. This is for previewing individual components, not for browsing large datasets.
-   **No Write Operations**: This API is strictly for reading data.
-   **Alternative Strategies**: For more complex scenarios or production-like previews, consider:
    -   Exporting data fixtures from TYPO3 and importing them as JSON in Storybook.
    -   A more robust, authenticated API if live data is truly needed beyond local development.

This basic dynamic data feature provides a powerful way to make your Storybook previews more representative of real TYPO3 content during development.

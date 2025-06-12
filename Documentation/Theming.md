# Basic Theming in Storybook for Fluid Templates

This document outlines a basic approach to implementing theme switching (e.g., light/dark mode) for Fluid templates rendered in Storybook. This method leverages CSS custom properties and Storybook's global types and toolbar.

## Approach: CSS Custom Properties and Storybook Toolbar

1.  **Fluid Templates Use CSS Custom Properties**:
    -   The Fluid templates are styled using CSS that references CSS custom properties (CSS variables) for themeable aspects like colors, fonts, spacing, etc.
    -   Example:
        ```css
        /* In your TYPO3 extension's CSS file, loaded by your Fluid templates or globally */
        :root { /* Default (light) theme properties */
          --component-background: #ffffff;
          --component-text-color: #333333;
          --component-border-color: #cccccc;
        }

        [data-theme="dark"] { /* Dark theme overrides */
          --component-background: #333333;
          --component-text-color: #ffffff;
          --component-border-color: #555555;
        }

        .my-themed-component {
          background-color: var(--component-background);
          color: var(--component-text-color);
          border: 1px solid var(--component-border-color);
          padding: 15px;
        }
        ```

2.  **Storybook Global Type for Theme Selection**:
    -   In `.storybook/preview.js`, a global type is defined to represent the theme choice (e.g., 'light', 'dark').
    -   A toolbar item is configured to allow users to switch this global type.

3.  **Applying the Theme**:
    -   A Storybook decorator in `.storybook/preview.js` listens to changes in this global theme type.
    -   When the theme changes, the decorator updates the `data-theme` attribute on a wrapper element around the story or directly on the `document.documentElement`. The CSS then applies the appropriate custom property values.

## Implementation Example

### Fluid Template (`ThemedComponent.html`)
```html
<div class="my-themed-component">
    <h3>{headline}</h3>
    <p>This component's appearance is controlled by CSS custom properties, which can be changed by the selected theme.</p>
</div>
```
*(CSS for `.my-themed-component` should be defined in your TYPO3 extension and use `var(--component-background)`, etc.)*

### Storybook Configuration (`.storybook/preview.js`)
```javascript
import { useEffect } from '@storybook/preview-api'; // For Storybook 7+

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'paintbrush', // Storybook icon
      items: [
        { value: 'light', title: 'Light Mode' },
        { value: 'dark', title: 'Dark Mode' },
        // Add more themes if needed
      ],
      showName: true,
    },
  },
};

// Decorator to apply the theme
export const decorators = [
  (Story, context) => {
    const { theme } = context.globals;
    useEffect(() => {
      // Set the data-theme attribute on the root HTML element or a specific wrapper
      document.documentElement.setAttribute('data-theme', theme);
      // Or, if you want to scope it to the story root:
      // const storyRoot = document.getElementById('storybook-root'); // Or your specific story wrapper
      // if (storyRoot) {
      //   storyRoot.setAttribute('data-theme', theme);
      // }
    }, [theme]);

    return <Story {...context} />;
  },
];
```
*(Note: The above decorator uses React syntax `(<Story {...context} />)`. For HTML stories, the decorator structure might be slightly different, focusing on DOM manipulation before the story renders, or wrapping the story's output. Storybook 8 with `@storybook/html-webpack5` should handle this structure, but if issues arise, a simpler DOM manipulation within the decorator might be needed.)*
*Self-correction: For `@storybook/html-webpack5`, the decorator should return the story's node or a modified one. `useEffect` is React-specific. A more framework-agnostic way is needed.*

**Corrected Decorator for HTML framework:**
```javascript
// .storybook/preview.js (decorator part)

// Function to apply the theme
const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  // For more targeted application:
  // const storybookWrapper = document.getElementById('storybook-root'); // Or similar
  // if (storybookWrapper) {
  //  storybookWrapper.setAttribute('data-theme', theme);
  // }
};

export const decorators = [
  (StoryFn, context) => {
    const { theme } = context.globals;
    applyTheme(theme); // Apply initially

    // Storybook doesn't have a direct equivalent of useEffect for HTML framework that reruns on global change easily for the decorator itself.
    // However, Storybook should re-render the story when globals change, so applying it at the start of the decorator is usually sufficient.
    // For dynamic updates if the story itself doesn't re-render but globals do, one might need to listen to globalArgsUpdated event.
    // For now, this will apply on each story load/global change that forces re-render.

    return StoryFn(); // Renders the story
  },
];
```

### Story (`ThemedComponent.stories.js`)
The story itself doesn't need much theme-specific code if the template and CSS are set up correctly.

## Advantages
-   Uses standard CSS features.
-   Integrates well with Storybook's toolbar.
-   Allows for multiple themes.

## Limitations
-   Requires Fluid templates/CSS to be designed with CSS custom properties.
-   This basic setup applies the theme globally. More complex scoping might require more intricate decorators or CSS.
```

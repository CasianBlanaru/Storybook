// Resources/Public/Storybook/.storybook/preview.js
import { FluidTemplate } from '../../JavaScript/FluidTemplate.ts';

// @ts-ignore
window.FluidTemplate = FluidTemplate;

// Original parameters if they exist
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

// ---- Theming Start ----
export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'light', // Default theme
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'light', title: 'Light Mode' },
        { value: 'dark', title: 'Dark Mode' },
      ],
      showName: true,
      dynamicTitle: true, // Shows current theme name in toolbar
    },
  },
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  // console.log(`Theme changed to: ${theme}`); // For debugging
};

export const decorators = [
  (StoryFn, context) => {
    const { theme } = context.globals;
    applyTheme(theme);
    return StoryFn();
  },
];
// ---- Theming End ----

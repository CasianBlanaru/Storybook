// Resources/Public/Storybook/.storybook/preview.js
import { FluidTemplate } from '../../JavaScript/FluidTemplate.ts'; // Adjust path as needed

// Make FluidTemplate available globally for convenience in stories
// @ts-ignore
window.FluidTemplate = FluidTemplate;
// Note: Using window global is convenient but not always best practice.
// Stories could also import FluidTemplate directly:
// import { FluidTemplate } from '../../JavaScript/FluidTemplate';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

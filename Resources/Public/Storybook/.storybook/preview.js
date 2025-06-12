// Example for .storybook/preview.js
// This ensures that our FluidTemplate.js is loaded before stories try to use it.
// This is one way to make it available. Another is to import it in each story or a helper.
// By adding it to staticDirs and then here, we ensure it's loaded.
// Note: This makes FluidTemplate a global.
// Alternatively, stories could import it if FluidTemplate.js is structured as an ES module
// and the Storybook setup correctly resolves it.
// For simplicity of this step, we'll assume FluidTemplate.js is loaded globally.

// It's better to create a preview-head.html to load the script
// to avoid issues with HMR and ensure it's loaded early.
// So, this file might just contain parameter type definitions or global decorators in the future.
// For now, it can be minimal.

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

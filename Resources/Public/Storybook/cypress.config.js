// Resources/Public/Storybook/cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:6007', // Base URL for cy.visit() in CI context
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.{js,jsx,ts,tsx}',
    video: false, // Disable video recording for CI to save resources
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  // Optionally configure component testing if needed later
  // component: {
  //   devServer: {
  //     framework: 'your-framework', // e.g., react, vue
  //     bundler: 'webpack',
  //   },
  // },
});

// Example for .storybook/main.js (syntax might vary slightly)
module.exports = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    // '@storybook/addon-interactions', // Optional: if we want interaction testing
  ],
  framework: {
    name: '@storybook/html-webpack5', // Or appropriate for plain JS/HTML
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  // Ensure static directories are served if FluidTemplate.js is outside Storybook's direct bundling
  staticDirs: ['../../JavaScript'], // This makes FluidTemplate.js available at /FluidTemplate.js
};

// Example for .storybook/main.js (syntax might vary slightly)
module.exports = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
       // '@storybook/addon-interactions',
       '@storybook/addon-a11y',
       './.storybook/addons/template-manifest-panel/preset', // Add this line for the local addon
  ],
  framework: {
    name: '@storybook/html-webpack5', // Or appropriate for plain JS/HTML
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  // staticDirs: ['../../JavaScript'], // REMOVE THIS LINE or comment out
};

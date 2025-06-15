// Resources/Public/Storybook/.storybook/preview.js
import { FluidTemplate } from '../../JavaScript/FluidTemplate.ts';
import { fetchTypo3Record } from '../../JavaScript/Typo3Data.ts';

// @ts-ignore
window.FluidTemplate = FluidTemplate;
// @ts-ignore
window.fetchTypo3Record = fetchTypo3Record;
// @ts-ignore
window.templateManifestData = { error: 'Manifest not yet loaded.', templates: [], partials: [], layouts: [] }; // Initialize

fetch('/template-manifest.json') // Assumes manifest is in Storybook's public path
  .then(response => {
     if (response.ok) return response.json();
     throw new Error('Template manifest not found or invalid. Run TYPO3 CLI: "storybook:generate-manifest" and ensure it is in the Storybook static path.');
  })
  .then(data => {
    // @ts-ignore
    window.templateManifestData = data;
    console.log('Template manifest loaded successfully for Storybook stories.', data);
  })
  .catch(error => {
     console.warn('Could not load template-manifest.json:', error.message);
     // @ts-ignore
     window.templateManifestData = { error: error.message, templates: [], partials: [], layouts: [] };
  });

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export let globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'light', title: 'Light Mode' },
        { value: 'dark', title: 'Dark Mode' },
      ],
      showName: true,
      dynamicTitle: true,
    },
  },
  // Define a global arg for panel-to-story communication
  // This arg will be updated by the panel and read by the ManifestDrivenStory
  // It's hidden from the toolbar by not providing 'toolbar' config
  panelSelectedTemplatePath: {
    name: 'Panel Selected Template',
    description: 'Holds the template path selected from the custom Fluid Templates panel.',
    defaultValue: '', // No default template initially selected by panel
    // No toolbar configuration means it's a hidden global arg / not in toolbar
  },
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
};

export const decorators = [
  (StoryFn, context) => {
    const { theme } = context.globals;
    applyTheme(theme);
    return StoryFn();
  },
];

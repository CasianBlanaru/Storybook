// Resources/Public/Storybook/stories/SimpleFluidTemplate.stories.js

// For new stories, consider importing directly:
// import { FluidTemplate } from '../../JavaScript/FluidTemplate';
// Then call FluidTemplate directly instead of window.FluidTemplate

export default {
  title: 'TYPO3 Fluid/Simple Template',
  argTypes: {
    headline: { control: 'text' },
    content: { control: 'text' },
    templatePath: { control: 'text', defaultValue: 'EXT:fluid_storybook/Resources/Private/Templates/SimpleStory.html' },
  },
};

const Template = ({ templatePath, headline, content, ...args }) => {
  const container = document.createElement('div');

  // Assuming FluidTemplate is globally available via preview.js (window.FluidTemplate)
  // @ts-ignore (if in a TS context and window.FluidTemplate isn't fully typed on window)
  const ft = window.FluidTemplate || FluidTemplate; // Fallback if somehow not on window but imported

  if (typeof ft !== 'function') {
    container.innerHTML = 'Error: FluidTemplate function is not available. Check .storybook/preview.js';
    return container;
  }

  ft({ templatePath, variables: { headline, content } }) // Use 'ft'
    .then(html => {
      container.innerHTML = html;
    })
    .catch(error => { // error will implicitly be FluidTemplateError | string (or any)
      let errorMessage = 'An unexpected error occurred.';
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && error.message) {
        errorMessage = `<strong>${error.message}</strong>`;
        if (error.type) {
          errorMessage += `<br>Type: ${error.type}`;
        }
        if (error.status) {
          errorMessage += `<br>Status: ${error.status}`;
        }
        if (error.details) {
          errorMessage += `<br>Details: <pre>${error.details}</pre>`;
        }
      }
      container.innerHTML = `<div style="color: red; border: 1px solid red; padding: 10px; font-family: monospace;">${errorMessage}</div>`;
    });
  return container;
};

export const Default = Template.bind({});
Default.args = {
  headline: 'Hello from Storybook!',
  content: 'This content is passed as a variable to the Fluid template.',
  templatePath: 'EXT:fluid_storybook/Resources/Private/Templates/SimpleStory.html',
};

export const AnotherInstance = Template.bind({});
AnotherInstance.args = {
  headline: 'Another Example',
  content: 'Different variables, same template structure.',
  templatePath: 'EXT:fluid_storybook/Resources/Private/Templates/SimpleStory.html',
};

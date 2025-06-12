// Resources/Public/Storybook/stories/SimpleFluidTemplate.stories.js
export default {
  title: 'TYPO3 Fluid/Simple Template',
  argTypes: {
    headline: { control: 'text' },
    content: { control: 'text' },
    templatePath: { control: 'text', defaultValue: 'EXT:my_fluid_storybook/Resources/Private/Templates/SimpleStory.html' },
  },
};

const Template = ({ templatePath, headline, content, ...args }) => {
  const container = document.createElement('div');
  // Assumes FluidTemplate is globally available via preview-head.html
  if (typeof FluidTemplate !== 'function') {
    container.innerHTML = 'Error: FluidTemplate function is not loaded. Check .storybook/preview-head.html and staticDirs in main.js';
    return container;
  }

  FluidTemplate({ templatePath, variables: { headline, content } })
    .then(html => {
      container.innerHTML = html;
    })
    .catch(error => {
      // Handle structured error object
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
  return container; // Storybook will render this div, which gets updated asynchronously
};

export const Default = Template.bind({});
Default.args = {
  headline: 'Hello from Storybook!',
  content: 'This content is passed as a variable to the Fluid template.',
  templatePath: 'EXT:my_fluid_storybook/Resources/Private/Templates/SimpleStory.html',
};

export const AnotherInstance = Template.bind({});
AnotherInstance.args = {
  headline: 'Another Example',
  content: 'Different variables, same template structure.',
  templatePath: 'EXT:my_fluid_storybook/Resources/Private/Templates/SimpleStory.html',
};

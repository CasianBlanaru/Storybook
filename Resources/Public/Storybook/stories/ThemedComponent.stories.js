// Resources/Public/Storybook/stories/ThemedComponent.stories.js
export default {
  title: 'TYPO3 Fluid/Themed Component',
  tags: ['autodocs'],
  argTypes: {
    headline: { control: 'text' },
    templatePath: { control: 'text' },
  },
};

const Template = (args) => {
  const container = document.createElement('div');
  // @ts-ignore (FluidTemplate is on window for now)
  const ft = window.FluidTemplate;
  const { templatePath, ...variables } = args;

  if (typeof ft !== 'function') {
    container.innerHTML = 'Error: FluidTemplate function is not available.';
    return container;
  }

  ft({ templatePath, variables })
    .then(html => {
      container.innerHTML = html;
    })
    .catch(error => {
      // Basic error display
      container.innerHTML = `<pre style="color:red">${error.message || JSON.stringify(error)}</pre>`;
    });
  return container;
};

export const Default = Template.bind({});
Default.args = {
  templatePath: 'EXT:my_fluid_storybook/Resources/Private/Templates/ThemedComponent.html',
  headline: 'Themed Component Example',
};

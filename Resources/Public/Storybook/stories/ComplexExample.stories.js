// Resources/Public/Storybook/stories/ComplexExample.stories.js

// For new stories, consider importing directly:
// import { FluidTemplate } from '../../JavaScript/FluidTemplate';
// Then call FluidTemplate directly instead of window.FluidTemplate

/**
 * This story demonstrates rendering a more complex Fluid template (`ComplexStory.html`)
 * which includes conditional logic (f:if), loops (f:for), and partial rendering.
 * It showcases how to pass structured data (arrays, objects) and simple flags
 * as variables from Storybook to control the template's output.
 * The `status` argument also demonstrates a 'select' control.
 */
export default {
  title: 'TYPO3 Fluid/Complex Example',
  // Component: MyComponent, // Optional: If you have a wrapper component
  tags: ['autodocs'], // Enable autodocs for this story file
  argTypes: {
    mainHeadline: { control: 'text', description: 'The main headline for the component.' },
    showExtraInfo: { control: 'boolean', description: 'Toggle visibility of extra information block.' },
    extraInfoText: { control: 'text', description: 'Text content for the extra information block.' },
    items: { control: 'object', description: 'Array of items (e.g., [{id: 1, name: "Item A"}]) to be displayed in a list.' },
    status: {
      control: 'select',
      options: ['new', 'processing', 'review', 'completed', null],
      description: 'Select the status, affecting its display.',
    },
    templatePath: { control: 'text', description: 'Path to the Fluid template (EXT:...)' },
  },
};

const Template = (args) => {
  // ... (template rendering logic remains the same)
  const container = document.createElement('div');
  // @ts-ignore
  const ft = window.FluidTemplate || FluidTemplate;
  const { templatePath, ...variables } = args;

  if (typeof ft !== 'function') {
    container.innerHTML = 'Error: FluidTemplate function is not available. Check .storybook/preview.js';
    return container;
  }

  ft({ templatePath, variables })
    .then(html => {
      container.innerHTML = html;
    })
    .catch(error => {
      let errorMessage = 'An unexpected error occurred.';
      if (typeof error === 'string') {
         errorMessage = error;
      } else if (error && error.message) {
         errorMessage = `<strong>${error.message}</strong>`;
         if (error.type) errorMessage += `<br>Type: ${error.type}`;
         if (error.status) errorMessage += `<br>Status: ${error.status}`;
         if (error.details) errorMessage += `<br>Details: <pre>${error.details}</pre>`;
      }
      container.innerHTML = `<div style="color: red; border: 1px solid red; padding: 10px; font-family: monospace;">${errorMessage}</div>`;
    });
  return container;
};

export const DefaultView = Template.bind({});
/**
 * Default view of the complex component with all features active.
 * - Shows extra information.
 * - Displays a list of items.
 * - Status is set to 'processing'.
 */
DefaultView.args = {
  templatePath: 'EXT:my_fluid_storybook/Resources/Private/Templates/ComplexStory.html',
  mainHeadline: 'Complex Template Demo',
  showExtraInfo: true,
  extraInfoText: 'This information is shown based on a condition.',
  items: [
    { id: 1, name: 'Item Alpha', description: 'First item details' },
    { id: 2, name: 'Item Beta', description: 'Second item details' },
    { id: 3, name: 'Item Gamma', description: 'Third item details' },
  ],
  status: 'processing',
};

export const NoItemsAndNoExtraInfo = Template.bind({});
/**
 * Minimal view:
 * - Extra information is hidden.
 * - No items are provided.
 * - Status is 'new'.
 */
NoItemsAndNoExtraInfo.args = {
  templatePath: 'EXT:my_fluid_storybook/Resources/Private/Templates/ComplexStory.html',
  mainHeadline: 'Minimal View',
  showExtraInfo: false,
  extraInfoText: 'This should not be visible.',
  items: [],
  status: 'new',
};

export const CompletedStatus = Template.bind({});
/**
 * Example of a 'completed' status:
 * - Shows a different main headline.
 * - Status is set to 'completed'.
 * - Includes a specific item.
 */
CompletedStatus.args = {
  ...DefaultView.args,
  mainHeadline: 'Completed State Example',
  status: 'completed',
  items: [{ id: 4, name: 'Item Delta', description: 'A completed item' }]
};

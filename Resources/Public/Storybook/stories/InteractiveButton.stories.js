// Resources/Public/Storybook/stories/InteractiveButton.stories.js
import { action } from '@storybook/addon-actions'; // Import the action utility

/**
 * This story demonstrates how to use Storybook Actions to log interactions
 * with elements rendered from a Fluid template.
 *
 * We attach event listeners to buttons within the rendered HTML and,
 * when clicked, they trigger corresponding actions that appear in the
 * "Actions" panel in Storybook.
 */
export default {
  title: 'TYPO3 Fluid/Interactive Button',
  tags: ['autodocs'],
  argTypes: {
    headline: { control: 'text' },
    templatePath: { control: 'text' },
    // Define actions that can be logged. These will appear in the args table in docs.
    onButtonClick: { action: 'buttonClicked', description: 'Event logged when the main button is clicked.' },
    onAnotherClick: { action: 'anotherButtonClicked', description: 'Event logged for the second button.' },
  },
};

const Template = (args) => {
  const container = document.createElement('div');
  // @ts-ignore (FluidTemplate is on window for now)
  const ft = window.FluidTemplate;
  const { templatePath, headline, onButtonClick, onAnotherClick } = args; // Destructure actions

  if (typeof ft !== 'function') {
    container.innerHTML = 'Error: FluidTemplate function is not available.';
    return container;
  }

  ft({ templatePath, variables: { headline } })
    .then(html => {
      container.innerHTML = html;
      // After HTML is rendered, attach event listeners
      const button = container.querySelector('#interactive-action-button');
      if (button) {
        button.addEventListener('click', (event) => {
          // Call the Storybook action function passed in args
          onButtonClick({ domEvent: 'click', details: 'Main button was clicked!', targetId: event.target.id });
        });
      }

      const anotherButton = container.querySelector('#another-action-button');
      if (anotherButton) {
        anotherButton.addEventListener('click', (event) => {
          onAnotherClick({ details: 'The "Another Action" button was pressed.', targetId: event.target.id });
        });
      }
    })
    .catch(error => {
      container.innerHTML = `<pre style="color:red">${error.message || JSON.stringify(error)}</pre>`;
    });
  return container;
};

export const Default = Template.bind({});
Default.args = {
  templatePath: 'EXT:fluid_storybook/Resources/Private/Templates/InteractiveButton.html',
  headline: 'Button with Actions',
  // Storybook will automatically provide mock functions for these actions
  // if not explicitly passed, thanks to `action: '...'` in argTypes.
  // No need to define onButtonClick: action('buttonClicked') here in args usually.
};

/**
 * This example explicitly passes custom handler functions for actions,
 * though typically defining them in `argTypes` is enough for automatic logging.
 * This shows how one *could* override if needed, but it's often not necessary.
 */
export const WithExplicitActionHandlers = Template.bind({});
WithExplicitActionHandlers.args = {
  ...Default.args,
  headline: 'Button with Custom Action Handlers (Optional)',
  // Example of providing explicit functions, though argTypes usually handles it.
  // This is more for demonstrating the connection; action() from addon-actions is simpler.
  onButtonClick: (eventData) => {
     action('buttonClicked (custom)')({ ...eventData, customMsg: "Handled explicitly in story" });
     console.log("Custom handler for onButtonClick:", eventData);
  },
  onAnotherClick: (eventData) => {
     action('anotherButtonClicked (custom)')({ ...eventData, customMsg: "Also handled explicitly" });
     console.log("Custom handler for onAnotherClick:", eventData);
  }
};

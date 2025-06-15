// Resources/Public/Storybook/stories/ManifestDrivenStory.stories.js
// import { useEffect } from '@storybook/preview-api'; // Not using useEffect directly in HTML story render

const getManifestTemplateOptions = () => {
  // @ts-ignore
  const manifest = window.templateManifestData;

  if (manifest && manifest.templates && manifest.templates.length > 0) {
    return manifest.templates.map(t => ({
      value: t.path,
      title: `${t.name} (${t.extension}) - ${t.path.replace(/^EXT:[^/]+\/Resources\/Private\/Templates\//, '')}`
    }));
  } else if (manifest && manifest.error) {
    return [{value: '', title: `Error: ${manifest.error}`}];
  }
  return [{ value: '', title: 'Run CLI & refresh Storybook' }];
};

const initialTemplateOptions = getManifestTemplateOptions();

/**
 * This story allows selecting a template from the `template-manifest.json`.
 * The selection can be made via the "Select Template" control here, or by clicking
 * "Select Template" in the "Fluid Templates" panel (addon).
 * If the manifest changes (after CLI run), a Storybook refresh might be needed
 * for the dropdown options here to update. The panel updates more dynamically.
 */
export default {
  title: 'TYPO3 Fluid/Manifest Driven Story',
  tags: ['autodocs'],
  argTypes: {
    selectedTemplatePath: {
      name: 'Select Template (from Manifest or Panel)',
      control: 'select',
      options: initialTemplateOptions.map(opt => opt.value),
      mapping: initialTemplateOptions.reduce((acc, opt) => { acc[opt.value] = opt.title; return acc; }, {}),
      description: 'Choose a template. This control can be updated by selections made in the "Fluid Templates" panel (addon). If the list is empty/stale, run the TYPO3 CLI `storybook:generate-manifest` and refresh Storybook.',
    },
    variables: {
      control: 'object',
      description: 'JSON object of variables to pass to the selected template.',
      defaultValue: {
        headline: "Default Headline from Story",
        content: "Some default content for any template.",
        // Add other common variables from your project's templates
        mainHeadline: "Default Main Headline",
        showExtraInfo: true,
        extraInfoText: "Default extra info text from story.",
        items: [{ id: 1, name: 'Default Item from Story', description: 'Default item description' }],
        status: 'new',
        record: { uid: 0, header: "Default Record Header from Story", bodytext: "Default record bodytext from story."}
      }
    },
    // panelSelectedTemplatePath is not listed here as it's a global, not a direct control for this story's args.
  },
};

const Template = (args, context) => { // Add context to access globals
  const { globals } = context;
  const container = document.createElement('div');
  // @ts-ignore
  const ft = window.FluidTemplate;

  // Prioritize panel selection, then this story's own control, then empty.
  const templatePathToRender = globals.panelSelectedTemplatePath || args.selectedTemplatePath || '';

  // Log current selection sources for debugging
  // console.log('ManifestDrivenStory - Global panelSelected:', globals.panelSelectedTemplatePath);
  // console.log('ManifestDrivenStory - Arg selectedTemplatePath:', args.selectedTemplatePath);
  // console.log('ManifestDrivenStory - Rendering with:', templatePathToRender);

  if (typeof ft !== 'function') {
    container.innerHTML = 'Error: FluidTemplate function is not available. Check .storybook/preview.js';
    return container;
  }

  if (!templatePathToRender) {
    container.innerHTML = `<p>Please select a template using the controls above/below, or from the "Fluid Templates" panel.</p>
                           <p>If lists are empty or show an error, run TYPO3 CLI: <code>./vendor/bin/typo3 storybook:generate-manifest</code> and refresh.</p>`;
    // @ts-ignore
    if (window.templateManifestData && window.templateManifestData.error) {
        // @ts-ignore
        container.innerHTML += `<p style="color:orange;">Manifest loading issue: ${window.templateManifestData.error}</p>`;
    }
    return container;
  }

  ft({ templatePath: templatePathToRender, variables: args.variables || {} })
    .then(html => { container.innerHTML = html; })
    .catch(error => {
      container.innerHTML = `<pre style="color:red; border:1px solid red; padding:10px;"><strong>Error rendering ${templatePathToRender}:</strong><br>${error.message || JSON.stringify(error.details || error)}</pre>`;
    });
  return container;
};

export const SelectAndRender = Template.bind({});
SelectAndRender.args = {
  // Set an initial default for the story's own control.
  // If the panel makes a selection, it will override this for rendering.
  selectedTemplatePath: initialTemplateOptions.length > 0 && initialTemplateOptions[0].value !== '' ? initialTemplateOptions[0].value : '',
  variables: { // Merged with defaultValue in argTypes, this provides more specific initial values for this story
    headline: 'Selected from Manifest Story!',
    content: 'Content for the template selected via manifest.',
    myTextValue: 'This text will be uppercased by Fluid if the template uses it.',
    myArray: [{name: 'Item A from Manifest Story'}, {name: 'Item B from Manifest Story'}],
    mainHeadline: "Main Headline for Manifest",
    showExtraInfo: false,
    // items: [], // Example: override default items
    status: 'review',
  },
};

// Loader removed as per subtask description.
// The `selectedTemplatePath` arg will use its default or what's set by the panel via globals.
// The options for the `select` control are populated when the story module is initialized.

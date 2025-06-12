// Resources/Public/Storybook/stories/ContentElementFromDb.stories.js
// For this story, ensure Typo3Data.ts is available, e.g. by adding it to window or importing
// Let's assume fetchTypo3Record is made global in preview.js for simplicity here, like FluidTemplate.
// (This would require updating .storybook/preview.js to import and expose fetchTypo3Record)

/**
 * This story demonstrates fetching data for a TYPO3 content element (tt_content)
 * from the database via a custom API endpoint and rendering it with a Fluid template.
 * Note: The API endpoint for fetching data is intended for Development context ONLY.
 */
export default {
  title: 'TYPO3 Fluid/Content Element from DB',
  tags: ['autodocs'],
  argTypes: {
    uid: { control: 'number', description: 'UID of the tt_content record to fetch.' },
    // templatePath: { control: 'text' }, // Can be fixed for this CE type
    // tableName: { control: 'text' }, // Fixed to tt_content for this example
  },
};

const Template = (args, { loaded }) => { // Use Storybook loader pattern
  const container = document.createElement('div');

  if (loaded && loaded.error) {
    container.innerHTML = `<pre style="color:red">Error loading data: ${loaded.error}</pre>`;
    return container;
  }
  if (!loaded || !loaded.recordData) {
    container.innerHTML = '<p>Loading data or no data UID specified...</p>';
    // If UID is 0 or not set, loader might not run or return empty.
    if (args.uid > 0) container.innerHTML = '<p>Loading record data...</p>';
    return container;
  }

  // @ts-ignore (FluidTemplate is on window for now)
  const ft = window.FluidTemplate;
  if (typeof ft !== 'function') {
    container.innerHTML = 'Error: FluidTemplate function is not available.';
    return container;
  }

  // Pass the fetched record data to the Fluid template
  ft({
    templatePath: 'EXT:my_fluid_storybook/Resources/Private/Templates/CeTextMedia.html',
    variables: { record: loaded.recordData }
  })
    .then(html => {
      container.innerHTML = html;
    })
    .catch(error => {
      container.innerHTML = `<pre style="color:red">${error.message || JSON.stringify(error)}</pre>`;
    });
  return container;
};

export const TextMediaElement = Template.bind({});
TextMediaElement.args = {
  uid: 1, // Replace with an actual UID of a tt_content textmedia record in your DB
};
TextMediaElement.loaders = [
  async (context) => {
    const { uid } = context.args;
    if (!uid || uid <= 0) return { recordData: null }; // Don't fetch if UID is invalid/not set
    try {
      // @ts-ignore (fetchTypo3Record is on window for now)
      if (typeof window.fetchTypo3Record !== 'function') {
         return { error: "fetchTypo3Record function not available on window. Check .storybook/preview.js" };
      }
      // @ts-ignore
      const record = await window.fetchTypo3Record('tt_content', uid);
      return { recordData: record };
    } catch (error) {
      return { error: error.message || 'Failed to load record' };
    }
  },
];

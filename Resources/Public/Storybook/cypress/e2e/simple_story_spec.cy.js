// Resources/Public/Storybook/cypress/e2e/simple_story_spec.cy.js
describe('SimpleFluidTemplate Story', () => {
  it('should display the default rendered Fluid template content', () => {
    // Visit the iframe page directly for the specific story
    // Story ID can be found in Storybook's URL or by inspecting the manager.
    // Format: 'TYPO3 Fluid/Simple Template' -> 'typo3-fluid-simple-template--default'
    // (This might vary based on Storybook version and naming conventions, needs verification)
    // Let's assume the ID is 'typo3-fluid-simple-template--default' for now.
    // The URL would be 'iframe.html?id=typo3-fluid-simple-template--default&viewMode=story'

    // A more robust way to get story IDs is often by inspecting Storybook's manager UI
    // or by using addon-storysource if it shows IDs.
    // For now, we'll use a placeholder ID that is likely correct.
    const storyId = 'typo3-fluid-simple-template--default';
    cy.visit(`/iframe.html?id=${storyId}&viewMode=story`);

    // Check for the headline passed as a variable
    cy.contains('h1', 'Hello from Storybook!').should('be.visible');

    // Check for static text from the SimpleStory.html template
    cy.contains('p', 'This is a simple Fluid template rendered for Storybook.').should('be.visible');

    // Check that the API call was mocked/handled correctly if it were a real API call
    // For SimpleStory, it's static variables, so the above checks are sufficient.
  });

  it('should display content for "AnotherInstance" of SimpleFluidTemplate', () => {
     const storyId = 'typo3-fluid-simple-template--another-instance';
     cy.visit(`/iframe.html?id=${storyId}&viewMode=story`);
     cy.contains('h1', 'Another Example').should('be.visible');
     cy.contains('p', 'Different variables, same template structure.').should('be.visible');
  });
});

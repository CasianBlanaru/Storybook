// Resources/Public/Storybook/cypress/e2e/panel_interaction.cy.js
describe('Fluid Templates Panel Interaction', () => {
  beforeEach(() => {
    // Visit the Storybook root page.
    // The panel is part of the main UI, not the iframe.
    cy.visit('/');
  });

  it('should open the Fluid Templates panel and display its title', () => {
    // Open the addons panel if not already open (Storybook might remember its state)
    // This selector targets the button that shows the addons panel.
    // It might need adjustment based on Storybook's exact DOM structure.
    // A common approach is to ensure the panel is visible by clicking its tab.
    cy.get('#storybook-panel-root button, #storybook-panel-root button[role="tab"]') // General selector for panel tabs
      .contains('Fluid Templates', { matchCase: false }) // Find the tab by title
      .click({ force: true }); // Click it to make sure the panel is active

    // Check if the panel content has the expected title
    // This requires inspecting the panel's content structure.
    // Let's assume the H3 "Fluid Templates Manifest" is present.
    cy.get('#panel-my-vendor\\/template-manifest-panel') // Panel ID from constants.js, CSS escaped
      .should('be.visible')
      .contains('h3', 'Fluid Templates Manifest');
  });

  it('should allow selecting a template from the panel (logs to console/updates global arg)', () => {
    // Ensure the panel is open
    cy.get('#storybook-panel-root button, #storybook-panel-root button[role="tab"]')
      .contains('Fluid Templates', { matchCase: false })
      .click({ force: true });

    // Wait for manifest to potentially load and panel to render items
    // This assumes template-manifest.json is served at /template-manifest.json
    // and the panel fetches it. We need to wait for the list to populate.
    cy.get('#panel-my-vendor\\/template-manifest-panel')
      .contains('button', 'Select Template', { timeout: 10000 }) // Wait for buttons to appear
      .first() // Get the first "Select Template" button
      .click();

    // At this point, the panel's onClick handler should have:
    // 1. Logged to console (can't easily test this in Cypress E2E without extending Cypress logs)
    // 2. Shown an alert (Cypress can handle alerts: cy.on('window:alert', (str) => ...))
    // 3. Updated a global arg (api.updateGlobals({ panelSelectedTemplatePath: templatePath }))

    // For now, we'll just check that the click doesn't throw an error.
    // We can also listen for the alert.
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    // Re-click to ensure alert listener is attached before click
    cy.get('#panel-my-vendor\\/template-manifest-panel')
      .contains('button', 'Select Template')
      .first()
      .click()
      .then(() => {
        // Check if the stub was called (i.e., alert was shown)
        // The alert text is "Selected: <path>
        // (This interaction will be enhanced...)"
        // Corrected: The alert text is "Set global 'panelSelectedTemplatePath' to: <path>\nNavigate to "Manifest Driven Story" to see it applied (if not already there)."
        expect(alertStub).to.be.calledWith(Cypress.sinon.match(/^Set global 'panelSelectedTemplatePath' to: EXT:/));
      });
  });
});

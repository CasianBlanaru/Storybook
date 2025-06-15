// manager.js
import React, { useState, useEffect } from 'react';
import { addons, types, useStorybookApi } from '@storybook/manager-api';
import { AddonPanel } from '@storybook/components';
import { ADDON_ID, PANEL_ID } from './constants';

/**
 * @typedef {object} ManifestItem
 * @property {string} path - The EXT: path to the template.
 * @property {string} type - Type of Fluid resource (Template, Partial, Layout).
 * @property {string} extension - The extension key.
 * @property {string} name - The filename without extension.
 */

/**
 * @typedef {object} TemplateManifest
 * @property {ManifestItem[]} [templates]
 * @property {ManifestItem[]} [partials]
 * @property {ManifestItem[]} [layouts]
 * @property {string} [error] - Error message if manifest loading failed.
 */

/**
 * React component for the content of the "Fluid Templates" addon panel.
 * It fetches and displays the `template-manifest.json` and allows selecting templates.
 * @returns {JSX.Element}
 */
const ManifestPanelContent = () => {
  /** @type {[TemplateManifest | null, Function]} */
  const [manifest, setManifest] = useState(null);
  /** @type {[string | null, Function]} */
  const [error, setError] = useState(null);
  /** @type {[boolean, Function]} */
  const [isLoading, setIsLoading] = useState(true);

  const api = useStorybookApi(); // Storybook API for interacting with Storybook state

  /**
   * Fetches the template manifest data when the component mounts.
   */
  useEffect(() => {
    setIsLoading(true);
    fetch('/template-manifest.json') // Assumes Storybook serves this from a public directory
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch manifest: ${res.status} ${res.statusText}. Ensure 'storybook:generate-manifest' TYPO3 CLI command has been run.`);
        }
        return res.json();
      })
      .then(/** @param {TemplateManifest} data */ data => {
        setManifest(data);
        setIsLoading(false);
      })
      .catch(/** @param {Error} err */ err => {
        setError(err.message);
        setIsLoading(false);
        console.error("Error loading template manifest:", err);
      });
  }, []); // Empty dependency array means this effect runs once on mount.

  /**
   * Handles the selection of a template from the panel.
   * Updates a global Storybook argument to communicate the selected path.
   * @param {string} templatePath - The EXT: path of the selected template.
   */
  const handleSelectTemplate = (templatePath) => {
    api.updateGlobals({ panelSelectedTemplatePath: templatePath });
    console.log('Fluid Templates Panel: Set global arg "panelSelectedTemplatePath" to:', templatePath);
    // Future enhancement: Could try to navigate to the 'ManifestDrivenStory' automatically:
    // api.selectStory('typo3-fluid-manifest-driven-story--select-and-render'); // Story ID might vary
  };

  if (isLoading) {
    return <div style={{ padding: '1rem' }}>Loading template manifest...</div>;
  }
  if (error) {
    return <div style={{ padding: '1rem', color: 'red' }}>Error loading manifest: {error}</div>;
  }
  if (!manifest || (!manifest.templates?.length && !manifest.partials?.length && !manifest.layouts?.length)) {
    return <div style={{ padding: '1rem' }}>No manifest data found or manifest is empty. Please run the TYPO3 CLI command 'storybook:generate-manifest'.</div>;
  }

  return (
    <div style={{ padding: '1rem', fontSize: '14px', maxHeight: '100vh', overflowY: 'auto' }}>
      <h3>Fluid Templates Manifest</h3>
      {['templates', 'partials', 'layouts'].map(/** @param {keyof TemplateManifest} type */ type => (
        manifest[type] && manifest[type].length > 0 && (
          <div key={type} style={{ marginBottom: '1rem' }}>
            <h4 style={{ textTransform: 'capitalize', borderBottom: '1px solid #eee', paddingBottom: '0.3rem', marginBottom: '0.5rem' }}>
              {type} ({manifest[type].length})
            </h4>
            <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
              {manifest[type].map(/** @param {ManifestItem} item */ item => (
                <li key={item.path} style={{ marginBottom: '0.3rem', padding: '0.2rem', border: '1px solid #f0f0f0', borderRadius: '3px' }}>
                  <div><strong>{item.name}</strong> <span style={{fontSize: '0.9em', color: '#777'}}>({item.extension})</span></div>
                  <div style={{ fontSize: '0.8em', color: '#555', wordBreak: 'break-all' }}>{item.path}</div>
                  {type === 'templates' && (
                    <button
                       onClick={() => handleSelectTemplate(item.path)}
                       style={{ marginTop: '0.3rem', fontSize: '0.8em', padding: '3px 8px', cursor: 'pointer', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px' }}
                    >
                       Select Template
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      ))}
    </div>
  );
};

// Register the addon and its panel
addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Fluid Templates',
    render: ({ active, key }) => (
      <AddonPanel active={active} key={key}>
        <ManifestPanelContent />
      </AddonPanel>
    ),
  });
});

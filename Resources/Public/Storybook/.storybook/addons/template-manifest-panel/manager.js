// manager.js
import React, { useState, useEffect } from 'react';
import { addons, types, useStorybookApi } from '@storybook/manager-api'; // Import useStorybookApi
import { AddonPanel } from '@storybook/components';
import { ADDON_ID, PANEL_ID } from './constants';

const ManifestPanelContent = () => {
  const [manifest, setManifest] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const api = useStorybookApi(); // Get Storybook API

  useEffect(() => {
    fetch('/template-manifest.json')
       .then(res => {
         if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}. Run CLI.`);
         return res.json();
       })
       .then(data => { setManifest(data); setIsLoading(false); })
       .catch(err => { setError(err.message); setIsLoading(false); console.error("Error loading template manifest:", err); });
  }, []);

  const handleSelectTemplate = (templatePath) => {
    // Update the global arg when a template is selected
    api.updateGlobals({ panelSelectedTemplatePath: templatePath });
    console.log('Panel set global arg panelSelectedTemplatePath to:', templatePath);
    // Optionally, navigate to the ManifestDrivenStory if not already there
    // Consider the exact story ID (kind--story) for reliability
    // api.selectStory('typo3-fluid-manifest-driven-story--select-and-render'); // Example using generated ID
    // For now, let's alert and log. User can navigate manually.
    alert(`Set global 'panelSelectedTemplatePath' to: ${templatePath}\nNavigate to "Manifest Driven Story" to see it applied (if not already there).`);
  };

  if (isLoading) return <div style={{ padding: '1rem' }}>Loading template manifest...</div>;
  if (error) return <div style={{ padding: '1rem', color: 'red' }}>Error: {error}</div>;
  if (!manifest || (!manifest.templates && !manifest.partials && !manifest.layouts)) {
    return <div style={{ padding: '1rem' }}>No manifest data loaded or manifest is empty. Ensure you've run the TYPO3 CLI command 'storybook:generate-manifest'.</div>;
  }

  return (
    <div style={{ padding: '1rem', fontSize: '14px', maxHeight: '100vh', overflowY: 'auto' }}>
      <h3>Fluid Templates Manifest</h3>
      {['templates', 'partials', 'layouts'].map(type => (
        manifest[type] && manifest[type].length > 0 && (
          <div key={type} style={{ marginBottom: '1rem' }}>
            <h4 style={{ textTransform: 'capitalize', borderBottom: '1px solid #eee', paddingBottom: '0.3rem', marginBottom: '0.5rem' }}>
              {type} ({manifest[type].length})
            </h4>
            <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
              {manifest[type].map(item => (
                <li key={item.path} style={{ marginBottom: '0.3rem', padding: '0.2rem', border: '1px solid #f0f0f0' }}>
                  <div><strong>{item.name}</strong> ({item.extension})</div>
                  <div style={{ fontSize: '0.8em', color: '#555' }}>{item.path}</div>
                  {type === 'templates' && (
                    <button
                       onClick={() => handleSelectTemplate(item.path)}
                       style={{ marginTop: '0.2rem', fontSize: '0.8em', padding: '2px 5px' }}
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

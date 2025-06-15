// preset.js
function managerEntries(entry = []) {
  return [...entry, require.resolve('./manager')]; // Or makeManagerConfig
}

module.exports = {
  managerEntries,
  // previewAnnotations: (entry = []) => [...entry, require.resolve('./preview')], // If addon had preview logic
};

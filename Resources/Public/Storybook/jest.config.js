// Resources/Public/Storybook/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom', // Use jsdom for browser-like environment
  roots: ['../JavaScript/__tests__'], // Point to the directory where tests are located relative to this config
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { /* ts-jest config options if needed */ }]
  },
  // Optional: Setup files, module name mapper if needed later
  // setupFilesAfterEnv: ['./jest.setup.js'], // if you need setup files
};

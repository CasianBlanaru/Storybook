// Resources/Public/Storybook/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom', // Use jsdom for browser-like environment
  roots: ['../JavaScript/__tests__'], // Point to the directory where tests are located relative to this config
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { 
      tsconfig: {
        compilerOptions: {
          esModuleInterop: true,
          skipLibCheck: true,
          types: ['jest', 'node']
        }
      }
    }]
  },
  setupFilesAfterEnv: ['<rootDir>/../JavaScript/__tests__/jest.setup.js'],
  globals: {
    'ts-jest': {
      useESM: false
    }
  }
};

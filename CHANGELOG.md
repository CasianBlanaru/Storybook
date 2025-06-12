# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (starting from a hypothetical 0.1.0).

## [Unreleased]

### Added
- Nothing yet.

### Changed
- Nothing yet.

### Deprecated
- Nothing yet.

### Removed
- Nothing yet.

### Fixed
- Nothing yet.

### Security
- Nothing yet.

## [0.4.0] - YYYY-MM-DD
*(Phase 4: Advanced Storybook Features & Fluid Docs)*

### Added
- Basic theming capability in Storybook (light/dark mode) using CSS custom properties and a toolbar switcher (`ThemedComponent.html`, `ThemedComponent.stories.js`, `Documentation/Theming.md`).
- Interactive previews using Storybook Actions (`InteractiveButton.html`, `InteractiveButton.stories.js` demonstrating click event logging).
- `Documentation/FluidViewHelpers.md` explaining usage of standard and custom Fluid ViewHelpers, including limitations and conceptual examples.
- Documentation for Fluid inline syntax, partial rendering, and layout usage, added to `Documentation/FluidViewHelpers.md`.
- Example Fluid files (`SimpleLayout.html`, `PageWithLayout.html`) to support documentation.

## [0.3.0] - YYYY-MM-DD
*(Phase 3: Testing and Storybook Optimizations)*

### Added
- Jest testing framework setup for `FluidTemplate.ts` (`jest.config.js`, updated `package.json`).
- Initial test suite for `FluidTemplate.ts` (`FluidTemplate.test.ts`) covering success, API errors, network errors, and configuration errors.
- `@storybook/addon-a11y` for accessibility testing, added to Storybook configuration and dependencies.
- TSDoc comments to `FluidTemplate.ts` and its interfaces/types.
- JSDoc comments to `ComplexExample.stories.js` for improved Storybook Docs.
- `tags: ['autodocs']` to `ComplexExample.stories.js` for automatic documentation generation.

### Changed
- Enhanced `argTypes` in `ComplexExample.stories.js` with a `select` control for a new `status` variable and improved descriptions.
- Updated `ComplexStory.html` to include the new `status` variable.
- Verified `@storybook/addon-docs` configuration.

## [0.2.0] - YYYY-MM-DD
*(Phase 2: Enhanced Documentation & Technical Refinements)*

### Added
- `Documentation/AutomaticTemplateDiscovery.md` outlining conceptual strategy for template scanning.
- `Documentation/CachingStrategy.md` detailing server-side caching approach.
- Basic server-side caching for the `/api/fluid/render` endpoint using TYPO3 Caching Framework (`myfluidstorybook_renderresults` cache registered in `ext_localconf.php`).
- `X-FluidStorybook-Cache` debug header for API responses.
- Initial TypeScript support: converted `FluidTemplate.js` to `FluidTemplate.ts` with type definitions.
- `typescript` added to Storybook's `package.json`.

### Changed
- Refined API documentation in `README.md` for `FluidTemplate.ts` (parameters, Fluid interaction, error objects).
- Expanded `README.md` with more complex examples using conditions, loops, and partials (`ComplexStory.html`, `SimpleInfoPartial.html`).
- Improved error documentation in `README.md` aligning with structured error reporting.
- Storybook configuration updated to import `FluidTemplate.ts` as a module, removing `staticDirs` usage for it and `preview-head.html`.

## [0.1.0] - YYYY-MM-DD
*(Phase 1: Core Functionality & Documentation)*

### Added
- Basic TYPO3 Extension structure (`ext_emconf.php`, `composer.json`, standard directories).
- Core `FluidTemplate.js` function for fetching and rendering Fluid templates from TYPO3.
- TYPO3 API endpoint (`/api/fluid/render`) using `FluidRenderApiController` and `StandaloneView`.
- Basic Storybook setup (`@storybook/html-webpack5`) within `Resources/Public/Storybook/`.
- Example story (`SimpleFluidTemplate.stories.js`) and dummy Fluid template (`SimpleStory.html`).
- Initial `README.md` with project purpose, setup instructions, API docs, and basic troubleshooting.

### Changed
- Enhanced error handling in `FluidTemplate.js` to provide structured error objects and more descriptive messages.
- Example story updated to display structured errors more effectively.

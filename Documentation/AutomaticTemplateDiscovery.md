# Automatic Fluid Template Discovery for Storybook

This document outlines research and a conceptual strategy for automatically discovering Fluid templates within a TYPO3 project to make them more easily usable in Storybook.

## Goal

The primary goal is to simplify the process of finding and using Fluid templates in Storybook stories, reducing the need for developers to manually type or copy `EXT:...` paths. This could also enable features like a "template browser" within Storybook or auto-generating basic stories.

## Potential Methods

### 1. TYPO3 API Endpoint for Template Listing

-   **Concept**: Create a new API endpoint in the `fluid_storybook` extension (e.g., `/api/fluid/list-templates`).
-   **Functionality**:
    -   This endpoint would scan registered/active TYPO3 extensions.
    -   For each extension, it would look for Fluid files in standard locations:
        -   `Resources/Private/Templates/`
        -   `Resources/Private/Partials/`
        -   `Resources/Private/Layouts/`
    -   It could also potentially respect overrides in `EXT:my_site_extension/Resources/Private/Extensions/original_ext_key/...`.
    -   The endpoint would return a structured JSON response, e.g.:
        ```json
        {
          "templates": [
            { "path": "EXT:my_extension/Resources/Private/Templates/MyTemplate.html", "type": "Template", "extension": "my_extension" },
            // ... more templates
          ],
          "partials": [
            { "path": "EXT:my_extension/Resources/Private/Partials/MyPartial.html", "type": "Partial", "extension": "my_extension" },
            // ... more partials
          ],
          "layouts": [
            { "path": "EXT:my_extension/Resources/Private/Layouts/MyLayout.html", "type": "Layout", "extension": "my_extension" },
            // ... more layouts
          ]
        }
        ```
-   **Pros**:
    -   Dynamic: Reflects the current state of active extensions in TYPO3.
    -   Centralized logic within TYPO3, which has proper access to its environment.
    -   Can be called by Storybook at startup or on demand.
-   **Cons**:
    -   Performance: Scanning many extensions and files could be slow. Caching the result on the TYPO3 side would be essential.
    -   Security: The endpoint must be secured (e.g., admin-only, or restricted by IP, or a token) if it exposes potentially sensitive file structure information, though `EXT:` paths are already somewhat guessable. For local development, this might be less critical.
    -   Complexity: Implementing robust scanning and path resolution can be complex.

### 2. TYPO3 CLI Command for Generating a Manifest File

-   **Concept**: Create a TYPO3 Scheduler Task or a Symfony Command (e.g., `vendor/bin/typo3 storybook:generate-template-manifest`).
-   **Functionality**:
    -   The command would perform a similar scan as the API endpoint method.
    -   Instead of serving JSON dynamically, it would generate a static JSON file (e.g., `Resources/Public/Storybook/template-manifest.json` or in `typo3temp`).
    -   Storybook would then fetch this static manifest file.
-   **Pros**:
    -   Performance: No runtime scanning during Storybook use; Storybook loads a pre-generated file.
    -   Security: No dynamic endpoint exposing file structures; the manifest is generated in a controlled environment.
-   **Cons**:
    -   Static: The manifest can become outdated if new extensions are added or templates change. The command needs to be re-run (manually or via a watcher/hook if possible).
    -   Build Step: Introduces a build/generation step into the workflow.

## Proposed Integration with Storybook

Assuming a manifest (either from API or static file) is available:

-   **Template Picker**: A custom Storybook panel or a global parameter could allow users to select templates from a searchable dropdown list. Selecting a template would populate the `templatePath` arg for a generic story.
-   **Automatic Story Generation (Advanced)**: Could potentially scaffold basic stories for each discovered template, though this would be more complex as it would need to guess required variables.
-   **Enhanced `FluidTemplate` args**: The `templatePath` control in stories could be enhanced to use this list.

## Key Challenges & Considerations

-   **TYPO3 Extension Context**: Accurately determining which extensions are active and their paths. TYPO3's `PackageManager` and `PathUtility` can help.
-   **Path Resolution**: Handling different ways paths might be configured (e.g., `templateRootPaths`, `partialRootPaths`, `layoutRootPaths` in `ext_localconf.php` or TypoScript). The initial scan might focus on conventional paths.
-   **Performance of Scanning**: File system operations can be slow. Efficient directory traversal and caching are crucial.
-   **Filtering**:
    -   Allowing users to configure include/exclude patterns for extensions or paths.
    -   Option to only scan specific extensions.
-   **Usability in Storybook**: How to best present a potentially long list of templates.
-   **Security of the Endpoint/Manifest**: Ensure no sensitive data or unintended file paths are exposed.

## Recommended Approach (Conceptual)

A combination might be best:

1.  **Develop a TYPO3 Service/Utility** responsible for scanning and listing templates. This core logic can be reused. *(Partially addressed by the logic within the current CLI command, but could be further modularized).*
2.  **Implement a CLI Command** (`storybook:generate-template-manifest`) that uses this service to generate a `template-manifest.json` within the `fluid_storybook` extension's `Resources/Public/Storybook/` directory. This is the primary recommended way for production/CI. *(A basic version of this CLI command has been implemented. It can scan specified extensions or all active non-system extensions.)*
3.  **Optionally, provide an API Endpoint** (`/api/fluid/list-templates`) that uses the same service, primarily for dynamic discovery during local development if explicitly enabled. This endpoint should have clear security warnings and possibly be disabled by default. *(Not yet implemented).*
4.  Storybook then primarily relies on the `template-manifest.json`. *(Basic consumption of the manifest is implemented in `preview.js` for global availability, by the "Manifest Driven Story", and by the experimental "Fluid Templates" panel).*

This approach balances performance, security, and developer convenience. The manifest generation can be part of a build process or run manually when needed.

## Next Steps (for future implementation)

-   Refine the structure of `template-manifest.json` if needed.
-   Further enhance the TYPO3 service/utility for template scanning (e.g., more robust path resolution, override handling, advanced filtering).
-   Implement the optional dynamic API endpoint (`/api/fluid/list-templates`) if deemed valuable.
-   Further develop Storybook components/addons to consume the manifest for a richer UI experience (e.g., more dynamic global template selector, direct story generation from manifest).
-   Improve error handling and user feedback for manifest generation and consumption.
```

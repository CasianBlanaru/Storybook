# Example TYPO3 Project for Fluid Storybook Integration

This document outlines the conceptual setup for a public example repository that demonstrates how to use the `fluid_storybook` extension in a real TYPO3 environment.

## Purpose

The example repository aims to:
- Provide a quick-start environment for users to see `fluid_storybook` in action.
- Showcase best practices for integrating Fluid templates with Storybook.
- Offer concrete examples of Fluid templates and corresponding Storybook stories.
- Reduce the barrier to entry for new users.

## Proposed Structure and Content

The example repository would be a self-contained TYPO3 project.

### 1. Base TYPO3 Installation
-   **TYPO3 Version**: Latest stable (e.g., TYPO3 12.4 LTS).
-   **Setup Method**: Composer-based installation.
-   **Local Development**: Recommend and provide configuration for DDEV-Local (`.ddev/config.yaml`) or a Docker Compose setup (`docker-compose.yml`). This ensures a consistent and easy-to-use local environment.
-   **Minimal Core**: Keep the TYPO3 setup minimal, with only necessary system extensions active.

### 2. Included Extensions

-   **`fluid_storybook` (This Project)**:
    -   Included as a Git submodule, a local path repository in `composer.json`, or simply copied in (submodule or path repo is cleaner for updates).
    -   The Storybook instance within this extension would be the one users run.
-   **`my_example_sitepackage` (A Custom Example Site Package)**:
    -   A dedicated lightweight TYPO3 extension created specifically for this example project.
    -   **Contents**:
        -   **Fluid Templates**:
            -   A simple page template (`DefaultPage.html`).
            -   A few example content element templates (e.g., `TextMedia.html`, `Accordion.html`, `Card.html`).
            -   At least one template that uses partials and demonstrates some complexity.
        -   **Partials/Layouts**: Corresponding partials or layouts if used by the example templates.
        -   **TypoScript**: Minimal TypoScript setup required for the page template and content elements (e.g., page setup, basic content element registration).
        -   **CSS/SCSS**: Basic styling for the example templates. This CSS should be loaded in TYPO3 and also accessible or understood by Storybook (e.g., if Storybook imports it, or if it's globally available). This can also be used to demonstrate the theming feature.
        -   **Configuration**: Any necessary `ext_localconf.php` or `ext_tables.php` (or `Configuration/...` YAML files for v12).

### 3. Storybook Configuration in the Example
-   The Storybook instance run from `fluid_storybook/Resources/Public/Storybook/` would be pre-configured with stories that render templates from `my_example_sitepackage`.
-   **Stories**:
    -   Example stories for each of the templates in `my_example_sitepackage`.
    -   These stories would demonstrate:
        -   Passing variables to the templates.
        -   Using different `argTypes` effectively.
        -   Theming (if applicable to the example templates).
        -   Action logging for interactive elements.
-   **Template Manifest (Future)**: Once the template manifest generation and consumption are fully implemented in `fluid_storybook`, the example repository would showcase this feature, perhaps by pre-generating the manifest or showing how to use it to easily create stories.

### 4. Documentation (`README.md` of the Example Repository)
-   **Clear Setup Instructions**:
    -   How to clone the repository.
    -   Step-by-step guide for setting up the local environment (DDEV/Docker commands: `ddev start`, `ddev composer install`, etc.).
    -   TYPO3 installation steps (e.g., `ddev exec ./vendor/bin/typo3 setup`).
    -   How to install Storybook dependencies (`ddev npm install --prefix packages/fluid_storybook/Resources/Public/Storybook`).
-   **Running Storybook**:
    -   Command to start the Storybook development server (`ddev npm run storybook --prefix ...`).
-   **Project Overview**:
    -   Explanation of the included extensions (`fluid_storybook`, `my_example_sitepackage`).
    -   How the Fluid templates from `my_example_sitepackage` are rendered in Storybook.
-   **Key Features Demonstrated**: Briefly list what users can explore (specific template examples, theming, actions, etc.).
-   **Link to `fluid_storybook` Repository**: A prominent link to the main `fluid_storybook` GitHub repository for issues, contributions, and detailed documentation of the core extension.

### 5. Licensing
-   The example repository should also have a clear license (e.g., MIT or GPL, consistent with the main extension).

## Benefits of this Approach
-   **Practical Demonstration**: Shows a working, non-trivial use case.
-   **Reproducible Environment**: DDEV/Docker ensures users can get it running quickly.
-   **Focus on Integration**: Highlights how `fluid_storybook` integrates with a typical site package structure.
-   **Learning Resource**: Serves as a valuable learning tool for users.

---
*This conceptual document will guide the future creation of the actual public example repository.*

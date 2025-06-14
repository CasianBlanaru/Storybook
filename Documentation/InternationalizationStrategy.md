# Documentation Internationalization (i18n) Strategy

This document outlines the strategy for translating project documentation into multiple languages to improve accessibility for a wider audience.

## Current Status

-   The main `README.md` file has a German counterpart, `README.de.md`, which currently serves as a placeholder with machine-translated headings and requires full human translation.
-   Language switcher links are present in both `README.md` and `README.de.md`.
-   Other documentation files within the `Documentation/` directory are currently only available in English.

## Goals for i18n

-   Provide key documentation in at least English and German, given TYPO3's strong presence in German-speaking countries.
-   Establish a manageable process for creating and maintaining translations.
-   Make it easy for users to find documentation in their preferred language.

## Scope of Translation

While translating all documentation would be ideal, a phased approach focusing on high-impact documents is recommended.

**Priority Documents for Translation (e.g., to German):**

1.  **`README.md`**: (Initial placeholder `README.de.md` exists) - Highest priority as it's the main entry point.
2.  **`Documentation/AdvancedRecipes.md`**: Contains practical guides that would greatly benefit from translation.
3.  **`Documentation/DynamicData.md`**: Explains a key feature with important security notes.
4.  **`Documentation/Theming.md`**: Details how to use theming features.
5.  **`Documentation/FluidViewHelpers.md`**: Important for understanding Fluid integration.

Other documents like `AutomatedDocumentationDeployment.md`, `CachingStrategy.md`, `ExampleRepositorySetup.md`, `TYPO3VersionCompatibility.md`, and `AutomaticTemplateDiscovery.md` are more technical or strategic and could be lower priority for initial translation efforts.

## Proposed Translation Process & Management

### 1. File Naming Convention
-   For a document named `OriginalDocument.md` (in English), its German translation should be named `OriginalDocument.de.md`.
-   This convention should be applied consistently within the `Documentation/` folder.

### 2. Language Switcher Links
-   Similar to the main README, each translated document should include a link to its English counterpart, and the English version should link to available translations.
-   Example at the top of `Documentation/SomeDoc.de.md`:
    `[Read this document in English](SomeDoc.md)`
-   Example at the top of `Documentation/SomeDoc.md`:
    `[Dieses Dokument auf Deutsch lesen](SomeDoc.de.md)` (Only if the German version exists)

### 3. Contribution Model
-   **Community Contributions**: Translations are an excellent area for community involvement. Contributions should be encouraged via Pull Requests.
-   **Review Process**: Ideally, native speakers or those proficient in the target language should review translations for accuracy and clarity.

### 4. Maintaining Synchronization
-   This is a common challenge in i18n.
-   **Manual Updates**: When the English (primary) version of a document is significantly updated, a note or issue should be created to flag that corresponding translations need updating.
-   **Clear Versioning in Source**: If possible, indicate in comments or via commit messages when content changes require translation updates.
-   **Community Help**: Rely on the community to point out outdated translations.
-   **Focus on Key Changes**: For minor edits to the English version (typos, clarifications), immediate updates to translations might not be critical, but substantial feature changes or API modifications should trigger a translation update.

### 5. Tools & Automation (Future Considerations)
-   **Dedicated Translation Platforms**: For larger projects, platforms like Weblate, Crowdin, or Transifex can help manage translation workflows, but this is likely overkill for the current scale.
-   **Markdown-aware Diffing**: Tools that can intelligently diff Markdown content might help identify changes that need translating.

## Initial Steps

1.  Complete the human translation of `README.de.md`.
2.  Prioritize the translation of `Documentation/AdvancedRecipes.md` and `Documentation/DynamicData.md` into German.
3.  Encourage community members to contribute translations for these and other documents.
4.  Implement the linking mechanism between translated document versions.

By adopting this strategy, we can gradually expand the language support for the project documentation, making it more accessible and user-friendly.

# Automated Documentation Deployment Strategy

This document outlines a conceptual strategy for automatically building and deploying the project documentation for `fluid_storybook`. The documentation primarily consists of the main `README.md` and various Markdown files within the `Documentation/` directory.

## Goals

-   Make documentation easily accessible online.
-   Ensure documentation is always up-to-date with the main branch.
-   Automate the publishing process.

## Options Considered

### 1. GitHub Pages directly from Markdown files
-   **Method**: Configure GitHub Pages to serve content directly from the `main` branch, either from the root or a `/docs` subfolder.
-   **Pros**:
    -   Extremely simple to set up; often just a few clicks in repository settings.
    -   No additional build tools or dependencies needed.
    -   Markdown files are rendered using GitHub's default styling, which is clean and readable.
-   **Cons**:
    -   Limited customization of theme and layout.
    -   Navigation might be basic (relying on manual links between pages).
    -   No advanced features like full-text search without third-party solutions.

### 2. Static Site Generator (SSG) with GitHub Pages
-   **Method**: Use an SSG (e.g., MkDocs, Docsify, Docusaurus, VitePress) to build an HTML site from the Markdown files. Deploy the generated static HTML site to GitHub Pages.
-   **Tools Examples**:
    -   **MkDocs**: Python-based, simple, good for project documentation, themeable. Uses a `mkdocs.yml` for configuration.
    -   **Docsify**: JavaScript-based, renders Markdown on the fly (no build step to HTML, just serves the `index.html` and JS). Very easy to get started.
    -   **Docusaurus/VitePress**: More powerful, React/Vue-based, offer more features like versioning, i18n, blogging, but also have a higher learning curve and more dependencies.
-   **Pros**:
    -   Professional look and feel with themes.
    -   Better navigation (auto-generated sidebars, table of contents).
    -   Full-text search capabilities (often built-in or via plugins).
    -   More control over layout and presentation.
-   **Cons**:
    -   Adds a build step to the CI/CD pipeline.
    -   Introduces new dependencies (Python or Node.js based, depending on the tool).
    -   Slightly more complex initial setup.

## Recommended Approach

A phased approach is recommended:

**Phase A: Simple GitHub Pages (Immediate)**
1.  **Consolidate Documentation**: Ensure all primary documentation files (`README.md` and files from `Documentation/`) are well-organized, potentially moving them into a `/docs` directory at the project root if GitHub Pages is configured to serve from there. (Alternatively, GitHub Pages can serve from the root of `main`).
2.  **Enable GitHub Pages**: In the repository settings, enable GitHub Pages to build from the `main` branch (and the chosen folder, e.g., `/docs` or `/` (root)).
3.  **Navigation**: Manually ensure links between documentation pages are correct and relative. Create a main landing page if using a `/docs` folder (e.g., `docs/index.md` could be a copy of or link to the main `README.md`).

**Phase B: Static Site Generator (Future Enhancement, if needed)**
1.  **Evaluate Need**: If the documentation becomes extensive and requires better navigation, search, or theming, then transition to an SSG.
2.  **Choose SSG**:
    -   For simplicity and good Markdown support, **MkDocs** (with a theme like `mkdocs-material`) or **Docsify** are excellent starting points. Docsify is particularly easy as it often doesn't require a separate build step for the HTML content itself.
3.  **Setup SSG**:
    -   Add SSG configuration files (e.g., `mkdocs.yml` for MkDocs, or an `index.html` and configuration for Docsify).
    -   Structure Markdown files as required by the SSG.
4.  **Update CI/CD Pipeline**: Add a job to the GitHub Actions workflow to:
    -   Install the SSG tool and its dependencies.
    -   Run the SSG build command (e.g., `mkdocs build` for MkDocs).
    -   Deploy the generated static site (e.g., from `site/` directory for MkDocs) to a `gh-pages` branch using an action like `peaceiris/actions-gh-pages`.

## Conceptual GitHub Actions Workflow for SSG (e.g., MkDocs - Phase B)

```yaml
# .github/workflows/deploy-docs.yml (Conceptual)
name: Deploy Documentation

on:
  push:
    branches:
      - main # Or your primary branch

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.x'

      - name: Install MkDocs and theme
        run: |
          pip install mkdocs mkdocs-material # Example dependencies

      - name: Build documentation
        run: mkdocs build # Generates static site in 'site' directory

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./site
          # publish_branch: gh-pages # Optional: specify branch
          # user_name: 'github-actions[bot]' # Optional
          # user_email: 'github-actions[bot]@users.noreply.github.com' # Optional
```

## Initial Focus

For the immediate future, **Phase A (Simple GitHub Pages directly from Markdown)** is recommended due to its simplicity. This provides immediate online access to the documentation with minimal overhead. The transition to an SSG (Phase B) can be considered later as the project and its documentation evolve.

To implement Phase A:
- No CI/CD changes are strictly necessary if GitHub Pages is set to build from `main` directly. The existing CI (`ci.yml`) already handles code quality.
- The main task is to ensure the Markdown files are well-linked and organized, possibly within a `/docs` folder if preferred for GitHub Pages configuration. For this project, keeping `Documentation/*` and `README.md` at the root and configuring GitHub Pages to serve from the root of the `main` branch might be the easiest start.
```

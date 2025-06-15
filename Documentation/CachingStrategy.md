# Caching Strategy for Rendered Fluid Templates

This document outlines a strategy for caching Fluid templates rendered via the `/api/fluid/render` endpoint to improve performance in Storybook, especially for frequently used components or complex templates.

## Goal

To reduce server load and decrease response times by serving previously rendered and cached HTML content when the same template is requested with the same variables.

## Proposed Caching Mechanism (Server-Side)

The caching will be implemented within the `FluidRenderApiController` in the `fluid_storybook` TYPO3 extension.

### 1. Using TYPO3 Caching Framework

-   **Cache Frontend/Backend**: Utilize TYPO3's Caching Framework. A `VariableFrontend` is suitable for storing serialized HTML content. The backend can be database-based, file-based, or any other backend configured in the TYPO3 instance (e.g., Redis, APCu).
-   **Cache Instance**: A dedicated cache instance should be registered for this purpose (e.g., `luidstorybookrenderresults`). This allows for specific configuration and clearing of this cache.

### 2. Cache Key Generation

A unique cache key is crucial. It should be generated based on:
-   **`templatePath`**: The full `EXT:...` path to the Fluid template.
-   **`variables`**: A hash of the JSON string representation of the `variables` object. This ensures that changes in variables result in a different cache entry. Using a cryptographic hash (e.g., SHA256) is robust.
-   **(Optional) Language/Site Context**: If templates could render differently based on site context or language (though `StandaloneView` is somewhat isolated), these parameters might need to be incorporated into the cache key. For the initial implementation, we'll assume context is primarily driven by `variables`.

Example Cache Identifier: `sha256(templatePath + ":" + sha256(json_encode(variables)))`

### 3. Cache Lifetime and Invalidation

-   **Lifetime**: Cache entries should have a configurable lifetime (e.g., 24 hours, 1 week). This can be set when writing to the cache.
-   **Invalidation**:
    -   **Global**: The cache can be cleared via the TYPO3 backend's cache management tools by clearing the `luidstorybookrenderresults` cache.
    -   **Automatic (Content Changes)**: True automatic invalidation when a Fluid template file changes or related data changes is complex with `StandaloneView` as it doesn't have deep context awareness.
        -   A simple approach is to rely on manual cache clearing or time-based expiration.
        -   During development, it's often useful to disable caching or have a very short cache lifetime. This could be a configuration option for the extension.
    -   **Programmatic**: If specific events (e.g., extension update, specific data update) are known to affect template rendering, programmatic cache clearing for related entries could be implemented if a tagging system is used with the cache.

### 4. Workflow in `FluidRenderApiController`

1.  Receive `templatePath` and `variables` from the request.
2.  Generate the cache identifier.
3.  Attempt to fetch an entry from the `luidstorybookrenderresults` cache using this identifier.
4.  **Cache Hit**: If a valid cache entry exists, return the cached HTML content.
5.  **Cache Miss**:
    -   Render the Fluid template as usual using `StandaloneView`.
    -   Store the rendered HTML in the cache with the generated identifier and a defined lifetime.
    -   Return the newly rendered HTML content.

### 5. Configuration Options

-   Enable/disable caching globally for the extension (useful for development).
-   Set default cache lifetime.

## Considerations

-   **Cache Size**: Rendering many different templates with many variable combinations can lead to a large cache. File-based backends should be managed regarding disk space.
-   **Development Mode**: Caching should ideally be disabled or very short-lived during active template development to ensure changes are immediately visible.
-   **Dynamic Content in Templates**: If Fluid templates fetch real-time data directly (not recommended for pure component rendering in Storybook, but possible), caching can lead to stale content. The design of templates for Storybook should favor passing all dynamic aspects via `variables`.

## Future Enhancements

-   **Cache Tagging**: If using a cache backend that supports tagging (e.g., Redis), tags could be added (e.g., `extension_key_myext`, `template_file_MyTemplate.html`). This would allow for more granular cache clearing.
-   **Conditional Caching**: Allow caching to be disabled per-request via a parameter (e.g., `noCache=1`) for debugging.
```

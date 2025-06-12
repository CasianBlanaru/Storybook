# TYPO3 Version Compatibility Analysis (v12, v11, v10)

This document analyzes the feasibility and potential challenges of making the `my_fluid_storybook` extension compatible with TYPO3 v11 and v10, in addition to its current v12 support.

## 1. PHP Version Requirements

-   **TYPO3 v12**: Requires PHP 8.1 - 8.2 (as of TYPO3 12.4 LTS).
-   **TYPO3 v11**: Requires PHP 7.4 - 8.1 (as of TYPO3 11.5 LTS).
-   **TYPO3 v10**: Requires PHP 7.2 - 7.4 (as of TYPO3 10.4 LTS).

**Current Codebase Analysis (my_fluid_storybook):**
-   The current PHP code uses features generally compatible with PHP 7.4+ (TYPO3 v11's minimum).
    -   Constructor property promotion (`private readonly PackageManager $packageManager` in `GenerateStorybookManifestCommand`) is PHP 8.0+.
    -   Readonly properties (`readonly`) are PHP 8.1+.
    -   Strict types (`declare(strict_types=1);`) are PHP 7.0+.
    -   Typed properties (`protected VariableFrontend $renderCache;`) are PHP 7.4+.
    -   Null coalescing operator (`??`) is PHP 7.0+.

**Implications for Compatibility:**
-   **For TYPO3 v11 (PHP 7.4 - 8.1):**
    -   Constructor property promotion (`private readonly PackageManager $packageManager`) needs to be refactored to traditional constructor with explicit property assignment.
    -   `readonly` keyword must be removed. Properties can still be effectively readonly by only having a getter or being private/protected without setters.
-   **For TYPO3 v10 (PHP 7.2 - 7.4):**
    -   All PHP 8.0+ features mentioned above are incompatible.
    -   Typed properties (`protected VariableFrontend $renderCache;`) are incompatible. Type hints would need to be in docblocks only.
    -   Return type declarations (e.g., `: void`, `: int`, `: ResponseInterface`) are PHP 7.0+ but some specific interface usage might depend on TYPO3 core versions.

## 2. TYPO3 Core API Differences & Other Considerations

### a. Symfony Commands (`GenerateStorybookManifestCommand`)
-   **Registration**:
    -   **v12/v11**: `Configuration/Commands.php` is the standard.
    -   **v10**: Commands were typically registered as services and tagged with `console.command`, or via `ext_localconf.php` by adding to `$GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['extbase']['commandControllers']` (for Extbase commands) or by directly manipulating the Symfony Application service. For non-Extbase Symfony commands, service tagging is the way.
-   **Dependency Injection**: Constructor injection for commands is standard in v11/v12. For v10, if not using full service configuration, `GeneralUtility::makeInstance()` might have been more common for dependencies.

### b. API Endpoint Controller (`FluidRenderApiController`)
-   **Current Approach (v12)**: `ActionController` with routing via `Configuration/Routes/Api.yaml`. Constructor uses `GeneralUtility::makeInstance()` for `CacheManager`.
-   **Compatibility for v11/v10**:
    -   `ActionController` itself exists in older versions.
    -   **Routing**:
        -   `Configuration/Routes/*.yaml` for site-based routing is primarily v11+. v10 had more limited YAML routing capabilities usually tied to sites.
        -   A more compatible approach for a generic API endpoint might be:
            -   **PSR-15 Middleware**: More modern and generally compatible from v10/v11 if the endpoint is stateless. Requires registration in `Configuration/RequestMiddlewares.php` (or `ext_localconf.php` for older style).
            -   **TYPO3 AJAX Page (`eID`)**: A very old but highly compatible method.
            -   **Extbase Plugin with `@route` annotations or `AjaxComponent` (TYPO3 v11+ for AjaxComponent)**: If the controller needs more Extbase context.
    -   **Dependency Injection**: `GeneralUtility::makeInstance()` for `CacheManager` is broadly compatible.

### c. PackageManager API
-   `$this->packageManager->isPackageActive(self::TARGET_EXTENSION_KEY)`: Generally available.
-   `$this->packageManager->getPackage(self::TARGET_EXTENSION_KEY)->getPackagePath()`: Generally available.

### d. Path Utilities (`PathUtility`, `Environment`)
-   `PathUtility::sanitizeTrailingSeparator()`: Available.
-   `Environment::getPublicPath()`, `Environment::getProjectPath()`: These are v9+ and generally stable.
-   `GeneralUtility::getFileAbsFileName()`: Long-standing utility.

### e. Caching Framework
-   `CacheManager`, `VariableFrontend`, `Typo3DatabaseBackend`: Core parts of the caching framework, stable across these versions.
-   **Registration**: Defining caches in `$GLOBALS['TYPO3_CONF_VARS']['SYS']['caching']['cacheConfigurations']` via `ext_localconf.php` is the standard and compatible way across v10-v12.

### f. File Utilities (`GeneralUtility`)
-   `GeneralUtility::getFilesInDir()`: Available and generally stable.
-   `GeneralUtility::writeFile()`: Available.
-   `GeneralUtility::mkdir_deep()`: Available.

## 3. Composer `composer.json`

-   To support multiple TYPO3 versions:
    ```json
    "require": {
      "php": ">=7.4", // Adjusted for widest reasonable range (v11 min, or v10 min if going that far)
      "typo3/cms-core": "^10.4 || ^11.5 || ^12.4"
    },
    "extra": {
      "typo3/cms": {
        "extension-key": "my_fluid_storybook",
        "cms-package-dir": "{$vendor-dir}/typo3/cms",
        "web-dir": ".Build/Web"
      }
    }
    ```
-   The PHP version constraint in `composer.json` would need to be lowered, e.g., to `^7.2` for TYPO3 v10 compatibility, which then dictates the PHP syntax level for the entire codebase.

## 4. Recommended Strategy & Effort Estimation

-   **Targeting TYPO3 v11**:
    -   **PHP**: Refactor PHP 8.0/8.1 syntax (constructor promotion, readonly). Codebase would target PHP 7.4.
    -   **APIs**: Most current APIs are compatible. Command registration and routing might need minor adjustments or verification.
    -   **Effort**: Medium. Requires careful code review and refactoring for PHP syntax. Testing across versions is key.

-   **Targeting TYPO3 v10**:
    -   **PHP**: Significant refactoring. Codebase must target PHP 7.2. Remove all typed properties, ensure all syntax is PHP 7.2 compatible.
    -   **APIs**:
        -   Command registration needs to use service tagging or older methods.
        -   Routing for the API endpoint will likely need a different approach (e.g., PSR-15 middleware registered via `ext_localconf.php`, or an eID script).
    -   **Effort**: High. Requires substantial PHP refactoring and changes to fundamental aspects like command registration and API routing. Maintaining a single codebase for v10-v12 would be challenging and might lead to more complex, harder-to-read code due to conditional logic or older patterns.

**General Recommendations:**

1.  **Decide on a Minimum Supported TYPO3 Version**: Supporting v10, v11, and v12 simultaneously with a clean, modern codebase is difficult.
    -   Supporting **v11 and v12** is more feasible.
    -   Supporting **v10** as well significantly increases complexity.
2.  **Conditional Logic**: Use `TYPO3\CMS\Core\Core\Environment::isVersion()` or `TYPO3_branch` checks for minor API differences or registration methods if absolutely necessary, but try to avoid excessive branching in code logic.
3.  **Separate Branches/Releases**: For very significant differences (like targeting v10 vs v11/v12), maintaining separate major versions of the extension aligned with TYPO3 major versions might be cleaner (e.g., `my_fluid_storybook` v1.x for TYPO3 v11, v2.x for TYPO3 v12).
4.  **Focus on PSR Standards**: Using PSR-15 middleware for the API endpoint could improve compatibility and modernity across versions (v10+).

## Conclusion for `my_fluid_storybook`

-   **Supporting TYPO3 v11 alongside v12**: Achievable with moderate effort, primarily refactoring PHP 8.0/8.1 features and testing API/routing configurations.
-   **Adding TYPO3 v10 support**: High effort. Would require significant PHP downgrades and changes to command/routing registration. This might compromise code quality and modern practices if trying to maintain a single codebase. It might be better to consider a separate, simplified version or branch for v10 if essential.

For now, the recommendation would be to target TYPO3 v12 primarily, and if backward compatibility is desired, aim for v11 next, accepting the necessary PHP syntax adjustments.
```

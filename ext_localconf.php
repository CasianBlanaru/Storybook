<?php
defined('TYPO3') or die();

if (!is_array($GLOBALS['TYPO3_CONF_VARS']['SYS']['caching']['cacheConfigurations']['fluid_storybook_renderresults'] ?? null)) {
    $GLOBALS['TYPO3_CONF_VARS']['SYS']['caching']['cacheConfigurations']['fluid_storybook_renderresults'] = [
        'frontend' => \TYPO3\CMS\Core\Cache\Frontend\VariableFrontend::class,
        'backend' => \TYPO3\CMS\Core\Cache\Backend\Typo3DatabaseBackend::class, // Or FileBackend, etc.
        'options' => [
            'defaultLifetime' => 3600, // Default lifetime in seconds (1 hour)
        ],
        'groups' => ['pages', 'all'], // Optional: Relate to standard cache groups
    ];
}

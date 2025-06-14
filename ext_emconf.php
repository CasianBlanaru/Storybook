<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'Fluid Storybook Integration',
    'description' => 'Allows rendering TYPO3 Fluid templates within Storybook.',
    'category' => 'fe',
    'author' => 'Pixelcoda',
    'author_email' => 'casianus@me.com',
    'state' => 'alpha',
    'clearCacheOnLoad' => 1,
    'version' => '0.1.0',
    'constraints' => [
        'depends' => [
            'typo3' => '12.4.0-12.4.99',
        ],
        'conflicts' => [],
        'suggests' => [],
    ],
];

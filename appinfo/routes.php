<?php
declare(strict_types=1);

return [
    'routes' => [
        ['name' => 'banner#getBanner', 'url' => '/banner', 'verb' => 'GET'],
        ['name' => 'banner#saveBanner', 'url' => '/banner', 'verb' => 'POST'],
    ],
];

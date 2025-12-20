<?php
declare(strict_types=1);

return [
    'routes' => [
        ['name' => 'banner#getBanner', 'url' => '/banner', 'verb' => 'GET'],
        ['name' => 'banner#listBanners', 'url' => '/banners', 'verb' => 'GET'],
        ['name' => 'banner#getBannerDetails', 'url' => '/banners/{id}', 'verb' => 'GET'],
        ['name' => 'banner#createBanner', 'url' => '/banners', 'verb' => 'POST'],
        ['name' => 'banner#updateBanner', 'url' => '/banners/{id}', 'verb' => 'PUT'],
        ['name' => 'banner#deleteBanner', 'url' => '/banners/{id}', 'verb' => 'DELETE'],
    ],
];

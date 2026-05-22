<?php

use App\Providers\AppServiceProvider;
use Illuminate\Support\Facades\URL;

test('login page serves vite assets over https when behind a proxy', function () {
    config(['app.url' => 'https://faro-nfca.onrender.com']);

    URL::forceScheme('https');
    URL::forceRootUrl('https://faro-nfca.onrender.com');

    $response = $this
        ->withHeaders([
            'X-Forwarded-Proto' => 'https',
            'X-Forwarded-For' => '203.0.113.1',
        ])
        ->get(route('login'));

    $response->assertOk();

    expect($response->getContent())
        ->not->toContain('http://faro-nfca.onrender.com/build/')
        ->toContain('https://faro-nfca.onrender.com/build/');
});

test('app service provider forces https scheme in production', function () {
    $app = app();
    $app->instance('env', 'production');

    config(['app.url' => 'https://faro-nfca.onrender.com']);

    (new AppServiceProvider($app))->boot();

    expect(URL::formatScheme())->toBe('https://');
});

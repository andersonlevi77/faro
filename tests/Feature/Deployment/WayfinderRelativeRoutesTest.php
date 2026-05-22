<?php

use App\Providers\AppServiceProvider;

test('wayfinder generates relative urls in console when app url is localhost', function () {
    $app = app();
    $app->instance('env', 'production');

    config(['app.url' => 'http://localhost']);

    (new AppServiceProvider($app))->boot();

    $this->artisan('wayfinder:generate', ['--with-form' => true])
        ->assertSuccessful();

    $loginRoutes = file_get_contents(base_path('resources/js/routes/login/index.ts'));

    expect($loginRoutes)
        ->not->toContain('localhost')
        ->not->toContain('faro.test')
        ->toContain("url: '/login'");
});

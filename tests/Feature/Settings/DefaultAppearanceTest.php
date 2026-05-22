<?php

test('login page uses light mode by default when no appearance cookie is set', function () {
    $response = $this->call('GET', route('login'), [], [], [], [
        'HTTP_COOKIE' => '',
    ]);

    $response->assertOk();

    $content = $response->getContent();

    expect($content)
        ->toContain("const appearance = 'light'")
        ->not->toContain('<html lang="es" class="dark">');
});

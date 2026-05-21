<?php

use App\Models\User;
use Illuminate\Support\Carbon;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('saludo')
        ->has('stats')
        ->has('proximasDevoluciones')
        ->has('atrasados')
        ->has('productosStockBajo'));
});

test('dashboard muestra buenas noches por la noche en guatemala', function () {
    Carbon::setTestNow(Carbon::parse('2026-05-19 21:00:00', 'America/Guatemala'));

    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('saludo', 'Buenas noches'));

    Carbon::setTestNow();
});

test('dashboard muestra buenos dias por la manana', function () {
    Carbon::setTestNow(Carbon::parse('2026-05-19 09:00:00', 'America/Guatemala'));

    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page->where('saludo', 'Buenos días'));

    Carbon::setTestNow();
});

test('dashboard muestra buenas tardes al mediodia', function () {
    Carbon::setTestNow(Carbon::parse('2026-05-19 15:00:00', 'America/Guatemala'));

    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page->where('saludo', 'Buenas tardes'));

    Carbon::setTestNow();
});

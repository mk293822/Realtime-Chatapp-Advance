<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(), // Generates a random name
            'email' => fake()->unique()->safeEmail(), // Generates a unique, safe email address
            'birth_date' => fake()->date(), // Generates a random date for birth
            'gender' => fake()->randomElement(['Male', 'Female']), // Randomly selects 'Male' or 'Female' from the list
            'email_verified_at' => now(), // Sets the current time for email verification
            'password' => static::$password ??= Hash::make('password'), // Uses a default password (hashed) or a pre-existing static password
            'remember_token' => Str::random(10), // Generates a random string for the remember token
            'active' => now(),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
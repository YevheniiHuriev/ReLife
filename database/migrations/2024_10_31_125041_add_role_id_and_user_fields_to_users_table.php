<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->constrained('roles')->onDelete('set null')->after('id');
            $table->string('photo')->nullable()->after('password');
            $table->string('first_name')->after('photo');
            $table->string('last_name')->after('first_name');
            $table->date('birthdate')->after('last_name');
            $table->string('phone')->after('birthdate');
            $table->text('address')->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn(['role_id', 'photo','first_name', 'last_name', 'phone', 'address']);
        });
    }
};

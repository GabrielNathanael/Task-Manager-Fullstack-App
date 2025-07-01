<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable(); 
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending'); 
            $table->timestamp('due_date')->nullable(); 
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // --- PERUBAHAN DI SINI ---
            // Menambahkan onDelete('cascade') pada relasi project_id
            $table->foreignId('project_id')->nullable()->constrained()->onDelete('cascade'); 
            
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};

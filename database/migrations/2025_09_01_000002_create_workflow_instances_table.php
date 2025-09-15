<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('workflow_instances', function (Blueprint $table) {
            $table->id();
            $table->string('workflow_name');
            $table->string('current_step')->nullable();
            $table->json('data')->nullable();
            $table->string('model_type')->nullable(); // optional primary model type
            $table->unsignedBigInteger('model_id')->nullable(); // primary model id
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('workflow_instances');
    }
};

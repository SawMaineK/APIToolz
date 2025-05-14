<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
			$table->string('key')->nullable(false); 
			$table->json('menu_config')->nullable(); 
			$table->json('branding')->nullable(); 
			$table->json('email_config')->nullable(); 
			$table->json('sms_config')->nullable(); 
			$table->json('other')->nullable(); 

            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {        
        Schema::drop('app_settings');
    }
};
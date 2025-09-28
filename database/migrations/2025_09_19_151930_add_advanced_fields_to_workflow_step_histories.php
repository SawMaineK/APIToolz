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
        Schema::table('workflow_step_histories', function (Blueprint $table) {
            $table->string('label')->nullable()->after('step_id');
            $table->string('status')->default('pending')->after('action'); // pending, in_progress, completed, failed
            $table->text('comment')->nullable()->after('status');
            $table->integer('duration')->nullable()->after('comment'); // in seconds
            $table->json('metadata')->nullable()->after('duration');
            $table->timestamp('started_at')->nullable()->after('metadata');
            $table->timestamp('completed_at')->nullable()->after('started_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workflow_step_histories', function (Blueprint $table) {
            $table->dropColumn([
                'label',
                'status',
                'comment',
                'duration',
                'metadata',
                'started_at',
                'completed_at',
            ]);
        });
    }
};

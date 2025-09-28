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
        Schema::table('workflow_instances', function (Blueprint $table) {
            $table->unsignedBigInteger('workflow_id')->after('id');
            $table->unsignedBigInteger('initiator_id')->nullable()->after('status');
            $table->string('current_step_label')->after('current_step');
            $table->string('priority')->default('normal')->after('initiator_id'); // low, normal, high, urgent
            $table->string('status')->nullable()->after('model_id');
            $table->timestamp('due_date')->nullable()->after('priority');
            $table->timestamp('completed_at')->nullable()->after('due_date');
            $table->timestamp('cancelled_at')->nullable()->after('completed_at');
            $table->string('failed_reason')->nullable()->after('cancelled_at');
            $table->json('metadata')->nullable()->after('failed_reason');

            $table->foreign('workflow_id')->references('id')->on('workflows')->onDelete('set null');
            $table->foreign('initiator_id')->references('id')->on('users')->onDelete('set null');
            $table->json('roles')->nullable()->after('initiator_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workflow_instances', function (Blueprint $table) {
            $table->dropForeign(['initiator_id', 'workflow_id']);
            $table->dropColumn([
                'workflow_id',
                'initiator_id',
                'roles',
                'priority',
                'due_date',
                'completed_at',
                'cancelled_at',
                'failed_reason',
                'metadata',
            ]);
        });
    }
};

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
        Schema::table('reimbursements', function (Blueprint $table) {
  if (!Schema::hasColumn('reimbursements', 'wallet_type')) {
            $table->string('wallet_type')->nullable();
        }

        if (!Schema::hasColumn('reimbursements', 'wallet_phone')) {
            $table->string('wallet_phone')->nullable();
        }

        if (!Schema::hasColumn('reimbursements', 'transfer_note')) {
            $table->text('transfer_note')->nullable();
        }

        if (!Schema::hasColumn('reimbursements', 'tripay_ref')) {
            $table->string('tripay_ref')->nullable();
        }

        if (!Schema::hasColumn('reimbursements', 'checkout_url')) {
            $table->string('checkout_url')->nullable();
        }

        if (!Schema::hasColumn('reimbursements', 'transferred_at')) {
            $table->timestamp('transferred_at')->nullable();
        }
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reimbursements', function (Blueprint $table) {
            $table->dropColumn([
                'wallet_type',
                'wallet_phone',
                'transfer_note',
                'tripay_ref',
                'checkout_url',
                'transferred_at',
            ]);
        });
    }
};

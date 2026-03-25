"use client";

import TransactionFilters from "@/components/transactions/transaction-filters";
import TransactionForm from "@/components/transactions/transaction-form";
import TransactionHistory from "@/components/transactions/transaction-history";
import useTransactionsManager from "@/components/transactions/use-transactions-manager";

/**
 * Orchestrates transaction form state, filters, list loading, and pagination.
 *
 * @param {{
 *   categories: Array<Record<string, unknown>>,
 *   initialTransactions: Array<Record<string, unknown>>,
 *   initialPagination: Record<string, number>
 * }} props
 * @returns {import("react").JSX.Element}
 */
export default function TransactionsManager({
  categories,
  initialTransactions,
  initialPagination,
}) {
  const {
    applyFilters,
    fetchTransactions,
    fieldErrors,
    filterCategories,
    filters,
    formCategories,
    formData,
    formError,
    handleCreateTransaction,
    handleFilterChange,
    handleFormChange,
    isLoading,
    isSubmitting,
    listError,
    pagination,
    resetFilters,
    transactions,
  } = useTransactionsManager({
    categories,
    initialPagination,
    initialTransactions,
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <TransactionForm
          categories={categories}
          fieldErrors={fieldErrors}
          formData={formData}
          formError={formError}
          formCategories={formCategories}
          isSubmitting={isSubmitting}
          onChange={handleFormChange}
          onSubmit={handleCreateTransaction}
        />
        <TransactionFilters
          filterCategories={filterCategories}
          filters={filters}
          isLoading={isLoading}
          onApply={applyFilters}
          onChange={handleFilterChange}
          onReset={resetFilters}
        />
      </div>

      <TransactionHistory
        fetchTransactions={fetchTransactions}
        isLoading={isLoading}
        listError={listError}
        pagination={pagination}
        transactions={transactions}
      />
    </div>
  );
}

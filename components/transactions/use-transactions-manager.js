"use client";

import { useState } from "react";

import { createInitialFormState } from "@/components/transactions/transaction-utils";

const initialFilterState = {
  period: "",
  from: "",
  to: "",
  type: "",
  categoryId: "",
  q: "",
  min: "",
  max: "",
  sort: "date_desc",
};

const initialFieldErrors = {
  type: [],
  categoryId: [],
  amount: [],
  date: [],
  comment: [],
};

function createSearchParams(nextFilters, nextPage) {
  const params = new URLSearchParams();

  Object.entries(nextFilters).forEach(([key, value]) => {
    if (!value) {
      return;
    }

    if ((key === "from" || key === "to") && nextFilters.period !== "custom") {
      return;
    }

    params.set(key, value);
  });

  params.set("page", String(nextPage));
  return params;
}

function createFetchTransactions({
  filters,
  setIsLoading,
  setListError,
  setPagination,
  setTransactions,
}) {
  return async function fetchTransactions(nextPage = 1, nextFilters = filters) {
    setIsLoading(true);
    setListError("");

    try {
      const response = await fetch(
        `/api/transactions?${createSearchParams(nextFilters, nextPage).toString()}`
      );
      const data = await response.json();

      if (!response.ok) {
        setListError(data.error || "Unable to load transactions right now.");
        return;
      }

      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch {
      setListError("Unexpected error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
}

function createTransactionSubmitHandler({
  categories,
  fetchTransactions,
  filters,
  formData,
  setFieldErrors,
  setFormData,
  setFormError,
  setIsSubmitting,
}) {
  return async function handleCreateTransaction(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setFieldErrors(initialFieldErrors);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, amount: Number(formData.amount) }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.issues) {
          setFieldErrors({ ...initialFieldErrors, ...data.issues.fieldErrors });
          setFormError(data.issues.formErrors?.[0] || "");
          return;
        }

        setFormError(data.error || "Unable to save transaction right now.");
        return;
      }

      setFormData(createInitialFormState(categories, formData.type));
      await fetchTransactions(1, filters);
    } catch {
      setFormError("Unexpected error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
}

function createFormChangeHandler(categories, setFormData) {
  return function handleFormChange(event) {
    const { name, value } = event.target;

    if (name === "type") {
      const nextCategory = categories.find((category) => category.type === value);
      setFormData((current) => ({ ...current, type: value, categoryId: nextCategory?.id || "" }));
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
  };
}

function createFilterChangeHandler(categories, setFilters) {
  return function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((current) => {
      const next = { ...current, [name]: value };

      if (name === "period" && value !== "custom") {
        next.from = "";
        next.to = "";
      }

      if (name === "type" && !isFilterCategoryValid(categories, current.categoryId, value)) {
        next.categoryId = "";
      }

      return next;
    });
  };
}

/**
 * Client hook that manages transaction creation, filtering, list refresh, and pagination state.
 *
 * @param {{
 *   categories: Array<Record<string, any>>,
 *   initialPagination: Record<string, number>,
 *   initialTransactions: Array<Record<string, any>>
 * }} params
 * @returns {{
 *   applyFilters: () => Promise<void>,
 *   fetchTransactions: (nextPage?: number, nextFilters?: Record<string, string>) => Promise<void>,
 *   fieldErrors: Record<string, string[]>,
 *   filterCategories: Array<Record<string, any>>,
 *   filters: Record<string, string>,
 *   formCategories: Array<Record<string, any>>,
 *   formData: Record<string, any>,
 *   formError: string,
 *   handleCreateTransaction: (event: SubmitEvent) => Promise<void>,
 *   handleFilterChange: (event: Event) => void,
 *   handleFormChange: (event: Event) => void,
 *   isLoading: boolean,
 *   isSubmitting: boolean,
 *   listError: string,
 *   pagination: Record<string, number>,
 *   resetFilters: () => Promise<void>,
 *   transactions: Array<Record<string, any>>
 * }}
 */
export default function useTransactionsManager({
  categories,
  initialPagination,
  initialTransactions,
}) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFilters] = useState(initialFilterState);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() =>
    createInitialFormState(categories, initialTransactions[0]?.type)
  );
  const formCategories = categories.filter((category) => category.type === formData.type);
  const filterCategories = filters.type
    ? categories.filter((category) => category.type === filters.type)
    : categories;
  const fetchTransactions = createFetchTransactions({
    filters,
    setIsLoading,
    setListError,
    setPagination,
    setTransactions,
  });
  const handleCreateTransaction = createTransactionSubmitHandler({
    categories,
    fetchTransactions,
    filters,
    formData,
    setFieldErrors,
    setFormData,
    setFormError,
    setIsSubmitting,
  });
  const handleFormChange = createFormChangeHandler(categories, setFormData);
  const handleFilterChange = createFilterChangeHandler(categories, setFilters);
  const resetFilters = async () => {
    setFilters(initialFilterState);
    await fetchTransactions(1, initialFilterState);
  };

  return {
    applyFilters: () => fetchTransactions(1, filters),
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
  };
}

function isFilterCategoryValid(categories, currentCategoryId, type) {
  return categories.some(
    (category) => category.id === currentCategoryId && (!type || category.type === type)
  );
}

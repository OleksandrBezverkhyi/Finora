"use client";

import { useState } from "react";

const initialForm = {
  name: "",
  type: "EXPENSE",
  color: "#0F766E",
};

const initialErrors = {
  name: [],
  type: [],
  color: [],
};

function createGroupedCategories(categories) {
  return {
    EXPENSE: categories.filter((category) => category.type === "EXPENSE"),
    INCOME: categories.filter((category) => category.type === "INCOME"),
  };
}

function mergeCategories(currentCategories, savedCategory, editingId) {
  const nextCategories = editingId
    ? currentCategories.map((category) => (category.id === savedCategory.id ? savedCategory : category))
    : [...currentCategories, savedCategory];

  return nextCategories.sort(sortCategories);
}

function createFormHandlers({ setEditingId, setFieldErrors, setFormData, setFormError }) {
  function resetForm() {
    setFormData(initialForm);
    setFieldErrors(initialErrors);
    setFormError("");
    setEditingId(null);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleEdit(category) {
    setEditingId(category.id);
    setFieldErrors(initialErrors);
    setFormError("");
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || initialForm.color,
    });
  }

  return { handleEdit, handleInputChange, resetForm };
}

function createSubmitHandler({
  editingId,
  formData,
  resetForm,
  setCategories,
  setFieldErrors,
  setFormError,
  setIsSubmitting,
}) {
  return async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setFieldErrors(initialErrors);

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/categories/${editingId}` : "/api/categories";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.issues) {
          setFieldErrors({ ...initialErrors, ...data.issues.fieldErrors });
          setFormError(data.issues.formErrors?.[0] || "");
          return;
        }

        setFormError(data.error || "Unable to save category right now.");
        return;
      }

      setCategories((current) => mergeCategories(current, data.category, editingId));
      resetForm();
    } catch {
      setFormError("Unexpected error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
}

function createDeleteHandler({ editingId, resetForm, setCategories, setDeletingId, setFormError }) {
  return async function handleDelete(categoryId) {
    setDeletingId(categoryId);
    setFormError("");

    try {
      const response = await fetch(`/api/categories/${categoryId}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error || "Unable to delete category right now.");
        return;
      }

      setCategories((current) => current.filter((category) => category.id !== categoryId));

      if (editingId === categoryId) {
        resetForm();
      }
    } catch {
      setFormError("Unexpected error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };
}

export default function useCategoriesManager(initialCategories) {
  const [categories, setCategories] = useState(initialCategories);
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState(initialErrors);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const groupedCategories = createGroupedCategories(categories);
  const { handleEdit, handleInputChange, resetForm } = createFormHandlers({
    setEditingId,
    setFieldErrors,
    setFormData,
    setFormError,
  });
  const handleSubmit = createSubmitHandler({
    editingId,
    formData,
    resetForm,
    setCategories,
    setFieldErrors,
    setFormError,
    setIsSubmitting,
  });
  const handleDelete = createDeleteHandler({
    editingId,
    resetForm,
    setCategories,
    setDeletingId,
    setFormError,
  });

  return {
    deletingId,
    editingId,
    fieldErrors,
    formData,
    formError,
    groupedCategories,
    handleDelete,
    handleEdit,
    handleInputChange,
    handleSubmit,
    isSubmitting,
    resetForm,
  };
}

function sortCategories(left, right) {
  if (left.type !== right.type) {
    return left.type.localeCompare(right.type);
  }

  return left.name.localeCompare(right.name);
}

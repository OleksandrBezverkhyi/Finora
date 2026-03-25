"use client";

import CategoryForm from "@/components/categories/category-form";
import CategorySections from "@/components/categories/category-sections";
import useCategoriesManager from "@/components/categories/use-categories-manager";

const typeOptions = [
  { value: "EXPENSE", label: "Expense" },
  { value: "INCOME", label: "Income" },
];

/**
 * Top-level category management component that wires form state to the category list UI.
 *
 * @param {{ initialCategories: Array<Record<string, unknown>> }} props
 * @returns {import("react").JSX.Element}
 */
export default function CategoriesManager({ initialCategories }) {
  const {
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
  } = useCategoriesManager(initialCategories);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <CategoryForm
        editingId={editingId}
        formData={formData}
        fieldErrors={fieldErrors}
        formError={formError}
        isSubmitting={isSubmitting}
        typeOptions={typeOptions}
        onInputChange={handleInputChange}
        onReset={resetForm}
        onSubmit={handleSubmit}
      />
      <CategorySections
        deletingId={deletingId}
        groupedCategories={groupedCategories}
        typeOptions={typeOptions}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
}

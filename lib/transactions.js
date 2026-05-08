export function buildTransactionCategorySnapshot(category) {
  return {
    categoryName: category.name,
    categoryColor: category.color ?? null,
  };
}

export function serializeTransactionRecord(transaction) {
  return {
    ...transaction,
    amount: transaction.amount.toString(),
    category: {
      id: transaction.category?.id ?? null,
      name: transaction.category?.name ?? transaction.categoryName,
      type: transaction.category?.type ?? transaction.type,
      color: transaction.category?.color ?? transaction.categoryColor ?? null,
      isDeleted: !transaction.category,
    },
  };
}

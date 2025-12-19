import { TransactionService } from '../src/services/transactionService.js';
import fs from 'fs';

beforeEach(() => {
  if (fs.existsSync('transactions.json')) fs.unlinkSync('transactions.json');
});

test('addTransaction creates a transaction with positive amount', () => {
  const t = TransactionService.addTransaction('income', 100, 'Salary');
  expect(t.amount).toBe(100);
  expect(t.type).toBe('income');
});

test('addTransaction throws error for negative amount', () => {
  expect(() => TransactionService.addTransaction('expense', -50, 'Food')).toThrow(
    'Amount must be positive',
  );
});

test('getBalance calculates correctly', () => {
  TransactionService.addTransaction('income', 100, 'Salary');
  TransactionService.addTransaction('expense', 40, 'Food');
  expect(TransactionService.getBalance()).toBe(60);
});

test('getTransactions returns all transactions', () => {
  TransactionService.addTransaction('income', 50, 'Gift');
  const transactions = TransactionService.getTransactions();
  expect(transactions.length).toBe(1);
  expect(transactions[0].amount).toBe(50);
});

import { TransactionDao } from '../src/data/transactionDao.js';
import { Transaction } from '../src/models/transaction.js';
import fs from 'fs';

beforeEach(() => {
  if (fs.existsSync('transactions.json')) fs.unlinkSync('transactions.json');
});

test('TransactionDao adds and retrieves transactions', () => {
  const t = new Transaction('1', 'income', 100, 'Salary', new Date().toISOString());
  TransactionDao.add(t);
  const all = TransactionDao.getAll();
  expect(all.length).toBe(1);
  expect(all[0].id).toBe('1');
});

test('TransactionDao deletes transaction by id', () => {
  const t = new Transaction('1', 'income', 100, 'Salary', new Date().toISOString());
  TransactionDao.add(t);
  TransactionDao.delete('1');
  const all = TransactionDao.getAll();
  expect(all.length).toBe(0);
});

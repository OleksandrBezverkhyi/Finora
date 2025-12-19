import { Transaction } from '../models/transaction.js';
import { TransactionDao } from '../data/transactionDao.js';
import { v4 as uuidv4 } from 'uuid';

export class TransactionService {
  static addTransaction(type, amount, category) {
    if (amount <= 0) throw new Error('Amount must be positive');
    const transaction = new Transaction(uuidv4(), type, amount, category, new Date().toISOString());
    TransactionDao.add(transaction);
    return transaction;
  }

  static getBalance() {
    const all = TransactionDao.getAll();
    return all.reduce((sum, t) => (t.type === 'income' ? sum + t.amount : sum - t.amount), 0);
  }

  static getTransactions() {
    return TransactionDao.getAll();
  }
}

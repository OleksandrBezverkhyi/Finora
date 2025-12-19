import fs from 'fs';
import { Transaction } from '../models/transaction.js';

const DATA_FILE = 'transactions.json';

export class TransactionDao {
  static getAll() {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  }

  static save(transactions) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(transactions, null, 2));
  }

  static add(transaction) {
    const all = this.getAll();
    all.push(transaction);
    this.save(all);
  }

  static delete(id) {
    const all = this.getAll().filter((t) => t.id !== id);
    this.save(all);
  }
}

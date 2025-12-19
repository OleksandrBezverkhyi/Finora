import { TransactionService } from '../../src/services/transactionService.js';
import { TransactionDao } from '../../src/data/transactionDao.js';

describe('Integration: TransactionService + TransactionDao', () => {
  beforeEach(() => {
    TransactionDao.clear();
  });

  test('Service creates transaction and DAO stores it', () => {
    const tx = TransactionService.addTransaction('income', 1000, 'salary');

    const stored = TransactionDao.getAll();

    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe(tx.id);
    expect(stored[0].amount).toBe(1000);
    expect(stored[0].type).toBe('income');
  });

  test('Service rejects invalid transaction and DAO is not called', () => {
    expect(() => {
      TransactionService.addTransaction('income', -500, 'salary');
    }).toThrow();

    const stored = TransactionDao.getAll();
    expect(stored.length).toBe(0);
  });
});

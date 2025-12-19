export class Transaction {
  constructor(id, type, amount, category, date) {
    this.id = id;
    this.type = type;
    this.amount = amount;
    this.category = category;
    this.date = date;
  }
}

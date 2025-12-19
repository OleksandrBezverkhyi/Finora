import db from '../db.js';
import bcrypt from 'bcryptjs';

export class User {
  static findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  static create(email, password, role) {
    const hashedPassword = bcrypt.hashSync(password, 8);
    const info = db
      .prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)')
      .run(email, hashedPassword, role);
    return { id: info.lastInsertRowid };
  }

  static validate(email, password) {
    const user = this.findByEmail(email);
    if (!user) return null;
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return null;
    return user;
  }
}

import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

const router = express.Router();
const SECRET = 'secret_key_for_jwt';

router.post('/register', (req, res) => {
  const { email, password, role } = req.body;
  if (User.findByEmail(email)) return res.status(400).json({ message: 'Email exists' });
  const newUser = User.create(email, password, role || 'user');
  res.json({ message: 'Registered', userId: newUser.id });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = User.validate(email, password);

  if (!user) {
    console.log('Користувача немає');
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1h' });
  res.json({ token, role: user.role });
});

export default router;

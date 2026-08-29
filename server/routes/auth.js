import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { readData, writeData, nextId } from '../db/store.js';
import { signToken, authRequired, roleRequired } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const data = readData();
  const user = data.users.find((u) => u.username === username);
  if (!user) return res.status(400).json({ error: 'Login yoki parol xato' });

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(400).json({ error: 'Login yoki parol xato' });

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, full_name: user.full_name, username: user.username, role: user.role },
  });
});

router.get('/me', authRequired, (req, res) => {
  res.json(req.user);
});

router.post('/users', authRequired, roleRequired('admin'), (req, res) => {
  const { full_name, username, password, role } = req.body;
  if (!full_name || !username || !password || !role) {
    return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" });
  }
  const data = readData();
  if (data.users.find((u) => u.username === username)) {
    return res.status(400).json({ error: 'Bu login band, boshqasini tanlang' });
  }
  const id = nextId(data, 'users');
  const hash = bcrypt.hashSync(password, 10);
  data.users.push({ id, full_name, username, password_hash: hash, role, created_at: new Date().toISOString() });
  writeData(data);
  res.json({ id, full_name, username, role });
});

router.get('/users', authRequired, roleRequired('admin'), (req, res) => {
  const data = readData();
  res.json(data.users.map(({ password_hash, ...rest }) => rest));
});

export default router;

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('./db');
const { generateToken, authMiddleware, parentOnly } = require('./auth');

const router = express.Router();

// ── Auth ────────────────────────────────────────────────────────────────

router.post('/auth/register', (req, res) => {
  const { email, name, password, role } = req.body;
  if (!email || !name || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!['parent', 'child'].includes(role)) {
    return res.status(400).json({ error: 'Role must be parent or child' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const result = db.prepare(
    'INSERT INTO users (email, name, password, role, avatar_color) VALUES (?, ?, ?, ?, ?)'
  ).run(email, name, hash, role, color);
  const user = db.prepare('SELECT id, email, name, role, avatar_color FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.json({ token: generateToken(user), user });
});

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const { password: _, ...safeUser } = user;
  res.json({ token: generateToken(user), user: safeUser });
});

// ── Profile ─────────────────────────────────────────────────────────────

router.get('/profile', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, avatar_color, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

router.put('/profile', authMiddleware, (req, res) => {
  const { name, avatar_color } = req.body;
  db.prepare('UPDATE users SET name = COALESCE(?, name), avatar_color = COALESCE(?, avatar_color) WHERE id = ?')
    .run(name || null, avatar_color || null, req.user.id);
  const user = db.prepare('SELECT id, email, name, role, avatar_color FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// ── Family Linking ──────────────────────────────────────────────────────

router.post('/link/generate', authMiddleware, parentOnly, (req, res) => {
  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  db.prepare('INSERT INTO link_codes (code, parent_id) VALUES (?, ?)').run(code, req.user.id);
  res.json({ code });
});

router.post('/link/join', authMiddleware, (req, res) => {
  if (req.user.role !== 'child') {
    return res.status(403).json({ error: 'Only child accounts can join a family' });
  }
  const { code } = req.body;
  const linkCode = db.prepare('SELECT * FROM link_codes WHERE code = ? AND used = 0').get(code);
  if (!linkCode) {
    return res.status(404).json({ error: 'Invalid or already-used code' });
  }
  const exists = db.prepare('SELECT id FROM family_links WHERE parent_id = ? AND child_id = ?')
    .get(linkCode.parent_id, req.user.id);
  if (exists) {
    return res.status(409).json({ error: 'Already linked to this parent' });
  }
  db.prepare('INSERT INTO family_links (parent_id, child_id) VALUES (?, ?)').run(linkCode.parent_id, req.user.id);
  db.prepare('UPDATE link_codes SET used = 1 WHERE id = ?').run(linkCode.id);
  const parent = db.prepare('SELECT id, name, avatar_color FROM users WHERE id = ?').get(linkCode.parent_id);
  res.json({ message: 'Linked successfully', parent });
});

router.get('/family', authMiddleware, (req, res) => {
  if (req.user.role === 'parent') {
    const children = db.prepare(`
      SELECT u.id, u.name, u.email, u.avatar_color,
             COALESCE(SUM(t.amount), 0) as balance
      FROM family_links fl
      JOIN users u ON u.id = fl.child_id
      LEFT JOIN transactions t ON t.child_id = u.id
      WHERE fl.parent_id = ?
      GROUP BY u.id
    `).all(req.user.id);
    res.json({ role: 'parent', children });
  } else {
    const parents = db.prepare(`
      SELECT u.id, u.name, u.avatar_color
      FROM family_links fl
      JOIN users u ON u.id = fl.parent_id
      WHERE fl.child_id = ?
    `).all(req.user.id);
    res.json({ role: 'child', parents });
  }
});

// ── Transactions ────────────────────────────────────────────────────────

router.post('/transactions', authMiddleware, parentOnly, (req, res) => {
  const { child_id, amount, description, source } = req.body;
  if (!child_id || amount == null || !description) {
    return res.status(400).json({ error: 'child_id, amount, and description are required' });
  }
  const link = db.prepare('SELECT id FROM family_links WHERE parent_id = ? AND child_id = ?')
    .get(req.user.id, child_id);
  if (!link) {
    return res.status(403).json({ error: 'This child is not linked to your account' });
  }
  const result = db.prepare(
    'INSERT INTO transactions (child_id, added_by, amount, description, source) VALUES (?, ?, ?, ?, ?)'
  ).run(child_id, req.user.id, amount, description, source || 'Other');
  const txn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
  res.json(txn);
});

router.get('/transactions/:childId', authMiddleware, (req, res) => {
  const childId = parseInt(req.params.childId);
  // Parents can view their linked children; children can view their own
  if (req.user.role === 'parent') {
    const link = db.prepare('SELECT id FROM family_links WHERE parent_id = ? AND child_id = ?')
      .get(req.user.id, childId);
    if (!link) return res.status(403).json({ error: 'Not linked' });
  } else if (req.user.id !== childId) {
    return res.status(403).json({ error: 'You can only view your own transactions' });
  }
  const transactions = db.prepare(
    `SELECT t.*, u.name as added_by_name
     FROM transactions t
     JOIN users u ON u.id = t.added_by
     WHERE t.child_id = ?
     ORDER BY t.created_at DESC`
  ).all(childId);
  const balance = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE child_id = ?')
    .get(childId).total;
  res.json({ transactions, balance });
});

module.exports = router;

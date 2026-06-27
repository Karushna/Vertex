const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM income WHERE user_id = ? ORDER BY date DESC, created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { description, amount, date } = req.body;
  if (!description || !amount) {
    return res.status(400).json({ error: 'description and amount are required' });
  }
  try {
    const incomeDate = date || new Date().toISOString().slice(0, 10);
    const [result] = await pool.execute(
      'INSERT INTO income (user_id, description, amount, date) VALUES (?, ?, ?, ?)',
      [req.user.id, description, amount, incomeDate]
    );
    const [rows] = await pool.execute('SELECT * FROM income WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

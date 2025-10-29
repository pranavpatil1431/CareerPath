// CareerPath server.js — Node + Express + MySQL2
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = 5000; // as requested

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static frontend folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// ---- CONFIG: edit if your MySQL credentials are different ----
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pass@123',
  database: 'careerpath',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
// --------------------------------------------------------------

let pool;
async function initDB() {
  pool = await mysql.createPool(dbConfig);
  // simple check
  const [rows] = await pool.query('SELECT 1 + 1 AS result');
  console.log('DB OK:', rows[0].result);
}

// Simple in-memory admin token (demo). For production use proper auth.
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
let activeAdminToken = null;

// Endpoint: apply (student submits form)
app.post('/apply', async (req, res) => {
  try {
    const { name, email, marks, stream, course } = req.body;
    if (!name || !email || !marks) return res.status(400).json({ error: 'Name, email and marks are required.' });
    const conn = await pool.getConnection();
    const sql = 'INSERT INTO students (name, email, marks, stream, course) VALUES (?, ?, ?, ?, ?)';
    const [result] = await conn.execute(sql, [name, email, Number(marks), stream || '', course || '']);
    conn.release();
    return res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint: get merit list (public)
app.get('/merit', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT id, name, email, marks, stream, course, applied_at FROM students ORDER BY marks DESC, applied_at ASC');
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin login (demo) — returns a token to be used in x-admin-token header
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    activeAdminToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
    return res.json({ ok: true, token: activeAdminToken });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// Middleware: check admin token
function adminAuth(req, res, next) {
  const token = req.header('x-admin-token');
  if (token && token === activeAdminToken) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// Admin: get applicants (requires token)
app.get('/admin/applicants', adminAuth, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT id, name, email, marks, stream, course, applied_at FROM students ORDER BY marks DESC, applied_at ASC');
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: download CSV
app.get('/admin/download/csv', adminAuth, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT id, name, email, marks, stream, course, applied_at FROM students ORDER BY marks DESC, applied_at ASC');
    conn.release();
    const header = 'id,name,email,marks,stream,course,applied_at\n';
    const csv = rows.map(r => [r.id, r.name, r.email, r.marks, r.stream, r.course, r.applied_at].map(v => '"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
    res.setHeader('Content-disposition', 'attachment; filename=merit_list.csv');
    res.set('Content-Type', 'text/csv');
    res.send(header + csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server after DB init
initDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Failed to initialize DB pool. Check MySQL server and credentials.', err);
  process.exit(1);
});

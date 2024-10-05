const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456'; // V produkci vždy používejte environment proměnnou!

// Middleware pro ověření hesla
const authenticatePassword = (req, res, next) => {
  const { password } = req.headers;
  if (password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Neplatné heslo' });
  }
};

// Získat všechny objednávky
app.get('/api/orders', authenticatePassword, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Získat jednu objednávku
app.get('/api/orders/:id', authenticatePassword, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Objednávka nenalezena' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vytvořit novou objednávku
app.post('/api/orders', async (req, res) => {
  const { customer_type, company_name, ic, first_name, last_name, email, address, voucher_type, discount_code, total_amount, invoice_note } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO orders (customer_type, company_name, ic, first_name, last_name, email, address, voucher_type, discount_code, total_amount, invoice_note) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [customer_type, company_name, ic, first_name, last_name, email, address, voucher_type, discount_code, total_amount, invoice_note]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aktualizovat objednávku
app.put('/api/orders/:id', authenticatePassword, async (req, res) => {
  const { customer_type, company_name, ic, first_name, last_name, email, address, voucher_type, discount_code, total_amount, invoice_note } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE orders SET customer_type = $1, company_name = $2, ic = $3, first_name = $4, last_name = $5, email = $6, address = $7, voucher_type = $8, discount_code = $9, total_amount = $10, invoice_note = $11, updated_at = CURRENT_TIMESTAMP WHERE id = $12 RETURNING *',
      [customer_type, company_name, ic, first_name, last_name, email, address, voucher_type, discount_code, total_amount, invoice_note, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Objednávka nenalezena' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Smazat objednávku
app.delete('/api/orders/:id', authenticatePassword, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Objednávka nenalezena' });
    }
    res.json({ message: 'Objednávka úspěšně smazána' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server běží na portu ${PORT}`));
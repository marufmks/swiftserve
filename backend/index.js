const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Test route
app.get('/', (req, res) => {
  res.send('API Running 🚀');
});

// ✅ Get all orders
app.get('/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ✅ Create new order
app.post('/orders', async (req, res) => {
  try {
    const { user_id } = req.body;

    const newOrder = await pool.query(
      'INSERT INTO orders (user_id) VALUES ($1) RETURNING *',
      [user_id]
    );

    res.json(newOrder.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating order');
  }
});

app.listen(4000, '0.0.0.0', () => {
  console.log('Server running on port 4000');
});
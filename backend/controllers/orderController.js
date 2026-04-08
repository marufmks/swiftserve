const pool = require('../db');

const getAllOrders = async (req, res) => {
  try {
    const { status, user_id, driver_id, limit = 50 } = req.query;
    
    let query = `
      SELECT o.*, 
             u.name as customer_name, u.phone as customer_phone,
             d.name as driver_name, d.phone as driver_phone,
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'product_name', p.name,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price,
                 'notes', oi.notes
               )
             ) FILTER (WHERE oi.id IS NOT NULL) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users d ON o.driver_id = d.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND o.status = $${params.length}`;
    }

    if (user_id) {
      params.push(user_id);
      query += ` AND o.user_id = $${params.length}`;
    }

    if (driver_id) {
      params.push(driver_id);
      query += ` AND o.driver_id = $${params.length}`;
    }

    query += ` GROUP BY o.id, u.name, u.phone, d.name, d.phone`;
    query += ` ORDER BY o.created_at DESC`;
    
    params.push(limit);
    query += ` LIMIT $${params.length}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT o.*, 
              u.name as customer_name, u.phone as customer_phone,
              d.name as driver_name, d.phone as driver_phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN users d ON o.driver_id = d.id
       WHERE o.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = result.rows[0];

    const itemsResult = await pool.query(
      `SELECT oi.*, p.name as product_name 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [id]
    );

    order.items = itemsResult.rows;
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const createOrder = async (req, res) => {
  const client = await pool.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { user_id, delivery_address, notes, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, delivery_address, notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, total, delivery_address, notes]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      const productResult = await client.query(
        'SELECT price FROM products WHERE id = $1 AND available = true',
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Product ${item.product_id} not available`);
      }

      const unitPrice = item.unit_price || productResult.rows[0].price;

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.product_id, item.quantity, unitPrice, item.notes]
      );
    }

    await client.query('COMMIT');

    const fullOrder = await getOrderByIdInternal(order.id);
    
    if (req.app.io) {
      req.app.io.emit('order:created', fullOrder);
    }

    res.status(201).json(fullOrder);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  } finally {
    client.release();
  }
};

const getOrderByIdInternal = async (id) => {
  const orderResult = await pool.query(
    `SELECT o.*, 
            u.name as customer_name, u.phone as customer_phone,
            d.name as driver_name, d.phone as driver_phone
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     LEFT JOIN users d ON o.driver_id = d.id
     WHERE o.id = $1`,
    [id]
  );

  if (orderResult.rows.length === 0) return null;

  const order = orderResult.rows[0];

  const itemsResult = await pool.query(
    `SELECT oi.*, p.name as product_name 
     FROM order_items oi 
     JOIN products p ON oi.product_id = p.id 
     WHERE oi.order_id = $1`,
    [id]
  );

  order.items = itemsResult.rows;
  return order;
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cooking', 'ready', 'en-route', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const fullOrder = await getOrderByIdInternal(id);

    if (req.app.io) {
      req.app.io.emit('order:status-changed', fullOrder);
    }

    res.json(fullOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const assignDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { driver_id } = req.body;

    if (!driver_id) {
      return res.status(400).json({ error: 'Driver ID is required' });
    }

    const driverCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND role = $2',
      [driver_id, 'driver']
    );

    if (driverCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid driver ID' });
    }

    const result = await pool.query(
      `UPDATE orders SET driver_id = $1, status = 'confirmed', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [driver_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const fullOrder = await getOrderByIdInternal(id);

    if (req.app.io) {
      req.app.io.emit('order:assigned', fullOrder);
      req.app.io.to(`driver:${driver_id}`).emit('order:assigned', fullOrder);
    }

    res.json(fullOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAvailableDrivers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, phone FROM users WHERE role = 'driver'"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  assignDriver,
  getAvailableDrivers,
};

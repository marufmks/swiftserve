/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Users table
  pgm.createTable('users', {
    id: 'id',
    name: { type: 'varchar(100)', notNull: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    role: {
      type: 'varchar(20)',
      notNull: true,
    },
    phone: { type: 'varchar(20)' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('users', 'users_role_check', {
    check: "role IN ('admin', 'driver', 'customer')",
  });

  // Products table
  pgm.createTable('products', {
    id: 'id',
    name: { type: 'varchar(100)', notNull: true },
    description: { type: 'text' },
    price: { type: 'numeric(10, 2)', notNull: true },
    category: { type: 'varchar(50)', notNull: true },
    image_url: { type: 'text' },
    available: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Orders table
  pgm.createTable('orders', {
    id: 'id',
    user_id: {
      type: 'integer',
      references: 'users',
      onDelete: 'SET NULL',
    },
    driver_id: {
      type: 'integer',
      references: 'users',
      onDelete: 'SET NULL',
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'pending',
    },
    total: { type: 'numeric(10, 2)', notNull: true, default: 0 },
    delivery_address: { type: 'text' },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('orders', 'orders_status_check', {
    check: "status IN ('pending', 'confirmed', 'cooking', 'ready', 'en-route', 'delivered', 'cancelled')",
  });

  // Order Items table
  pgm.createTable('order_items', {
    id: 'id',
    order_id: {
      type: 'integer',
      notNull: true,
      references: 'orders',
      onDelete: 'CASCADE',
    },
    product_id: {
      type: 'integer',
      notNull: true,
      references: 'products',
      onDelete: 'RESTRICT',
    },
    quantity: { type: 'integer', notNull: true, default: 1 },
    unit_price: { type: 'numeric(10, 2)', notNull: true },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Indexes
  pgm.createIndex('orders', 'user_id');
  pgm.createIndex('orders', 'driver_id');
  pgm.createIndex('orders', 'status');
  pgm.createIndex('orders', 'created_at');
  pgm.createIndex('order_items', 'order_id');
  pgm.createIndex('order_items', 'product_id');
  pgm.createIndex('products', 'category');
  pgm.createIndex('products', 'available');
};

exports.down = (pgm) => {
  pgm.dropTable('order_items');
  pgm.dropTable('orders');
  pgm.dropTable('products');
  pgm.dropTable('users');
};

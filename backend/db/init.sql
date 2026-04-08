-- SwiftServe Database Schema
-- PERN Stack: PostgreSQL, Express, React, Node

-- Drop existing tables (for fresh setup - remove in production)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (Admin, Driver, Customer)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'driver', 'customer')),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table (Menu items)
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cooking', 'ready', 'en-route', 'delivered', 'cancelled')),
  total NUMERIC(10, 2) DEFAULT 0,
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table (linking orders to products)
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_driver_id ON orders(driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(available);

-- Seed data: Users (password: 'password')
INSERT INTO users (name, email, password_hash, role, phone) VALUES
  ('Admin User', 'admin@swiftserve.local', '$2b$10$929ttaGeuTH2VQewrrtOqukh4quYZuSylffUqJ88/FB9TiKFEX5m.', 'admin', '555-0100'),
  ('John Driver', 'driver1@swiftserve.local', '$2b$10$929ttaGeuTH2VQewrrtOqukh4quYZuSylffUqJ88/FB9TiKFEX5m.', 'driver', '555-0101'),
  ('Jane Driver', 'driver2@swiftserve.local', '$2b$10$929ttaGeuTH2VQewrrtOqukh4quYZuSylffUqJ88/FB9TiKFEX5m.', 'driver', '555-0102'),
  ('Alice Customer', 'alice@example.com', '$2b$10$929ttaGeuTH2VQewrrtOqukh4quYZuSylffUqJ88/FB9TiKFEX5m.', 'customer', '555-0103'),
  ('Bob Customer', 'bob@example.com', '$2b$10$929ttaGeuTH2VQewrrtOqukh4quYZuSylffUqJ88/FB9TiKFEX5m.', 'customer', '555-0104');

-- Seed data: Products (sample restaurant menu)
INSERT INTO products (name, description, price, category, image_url, available) VALUES
  -- Burgers
  ('Classic Burger', 'Juicy beef patty with lettuce, tomato, and special sauce', 12.99, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', true),
  ('Cheese Burger', 'Classic burger topped with melted cheddar cheese', 14.99, 'Burgers', 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400', true),
  ('Double Stack', 'Two beef patties with double the flavor', 17.99, 'Burgers', 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400', true),
  ('Veggie Burger', 'Plant-based patty with fresh vegetables', 13.99, 'Burgers', 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400', true),
  
  -- Pizza
  ('Margherita Pizza', 'Fresh mozzarella, tomatoes, and basil', 15.99, 'Pizza', 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400', true),
  ('Pepperoni Pizza', 'Classic pepperoni with melted mozzarella', 17.99, 'Pizza', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', true),
  ('BBQ Chicken Pizza', 'Grilled chicken with tangy BBQ sauce', 18.99, 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', true),
  
  -- Drinks
  ('Soft Drink', 'Coca-Cola, Sprite, or Fanta (choose at delivery)', 2.99, 'Drinks', 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400', true),
  ('Fresh Lemonade', 'Freshly squeezed lemonade', 3.99, 'Drinks', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400', true),
  ('Iced Coffee', 'Cold brew coffee with ice', 4.99, 'Drinks', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', true),
  
  -- Sides
  ('French Fries', 'Crispy golden fries with seasoning', 4.99, 'Sides', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', true),
  ('Onion Rings', 'Crispy battered onion rings', 5.99, 'Sides', 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400', true),
  ('Chicken Wings', '6 piece crispy wings with your choice of sauce', 9.99, 'Sides', 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400', true);

-- Seed data: Sample orders
INSERT INTO orders (user_id, status, total, delivery_address, notes) VALUES
  (4, 'pending', 27.98, '123 Main St, Apt 4B', 'Ring doorbell twice'),
  (5, 'cooking', 32.97, '456 Oak Ave', 'Leave at door'),
  (4, 'delivered', 18.98, '123 Main St, Apt 4B', NULL);

-- Seed data: Sample order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  -- Order 1: Classic Burger + Fries + Soft Drink
  (1, 1, 1, 12.99),
  (1, 11, 1, 4.99),
  (1, 8, 2, 2.99),
  -- Order 2: Double Stack + Pizza + Wings + Lemonade
  (2, 3, 1, 17.99),
  (2, 5, 1, 15.99),
  (2, 13, 1, 9.99),
  (2, 9, 1, 3.99),
  -- Order 3: Veggie Burger + Onion Rings
  (3, 4, 1, 13.99),
  (3, 12, 1, 5.99);

-- Update order totals from items
UPDATE orders SET total = (
  SELECT COALESCE(SUM(quantity * unit_price), 0)
  FROM order_items
  WHERE order_items.order_id = orders.id
);

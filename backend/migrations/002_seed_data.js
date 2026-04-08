/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Seed users (password: 'password')
  pgm.sql(`
    INSERT INTO users (name, email, password_hash, role, phone) VALUES
      ('Admin User', 'admin@swiftserve.local', '$2b$10$929ttaGeuTH2VQewrrtOqukh4quYZuSylffUqJ88/FB9TiKFEX5m.', 'admin', '555-0100'),
      ('John Driver', 'driver1@swiftserve.local', '$2b$10$929ttaGeuTH2VQewrrtOqukh4quYZuSylffUqJ88/FB9TiKFEX5m.', 'driver', '555-0101'),
      ('Jane Driver', 'driver2@swiftserve.local', '$2b$10$929ttaGeuTH2VQewrrtOqukh4quYZuSylffUqJ88/FB9TiKFEX5m.', 'driver', '555-0102'),
      ('Alice Customer', 'alice@example.com', '$2b$10$929ttaGeuTH2VQewrrtOqukh4quYZuSylffUqJ88/FB9TiKFEX5m.', 'customer', '555-0103'),
      ('Bob Customer', 'bob@example.com', '$2b$10$929ttaGeuTH2VQewrrtOqukh4quYZuSylffUqJ88/FB9TiKFEX5m.', 'customer', '555-0104')
    ON CONFLICT (email) DO NOTHING;
  `);

  // Seed products
  pgm.sql(`
    INSERT INTO products (name, description, price, category, image_url, available) VALUES
      ('Classic Burger', 'Juicy beef patty with lettuce, tomato, and special sauce', 12.99, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', true),
      ('Cheese Burger', 'Classic burger topped with melted cheddar cheese', 14.99, 'Burgers', 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400', true),
      ('Double Stack', 'Two beef patties with double the flavor', 17.99, 'Burgers', 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400', true),
      ('Veggie Burger', 'Plant-based patty with fresh vegetables', 13.99, 'Burgers', 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400', true),
      ('Margherita Pizza', 'Fresh mozzarella, tomatoes, and basil', 15.99, 'Pizza', 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400', true),
      ('Pepperoni Pizza', 'Classic pepperoni with melted mozzarella', 17.99, 'Pizza', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', true),
      ('BBQ Chicken Pizza', 'Grilled chicken with tangy BBQ sauce', 18.99, 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', true),
      ('Soft Drink', 'Coca-Cola, Sprite, or Fanta (choose at delivery)', 2.99, 'Drinks', 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400', true),
      ('Fresh Lemonade', 'Freshly squeezed lemonade', 3.99, 'Drinks', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400', true),
      ('Iced Coffee', 'Cold brew coffee with ice', 4.99, 'Drinks', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', true),
      ('French Fries', 'Crispy golden fries with seasoning', 4.99, 'Sides', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', true),
      ('Onion Rings', 'Crispy battered onion rings', 5.99, 'Sides', 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400', true),
      ('Chicken Wings', '6 piece crispy wings with your choice of sauce', 9.99, 'Sides', 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400', true)
    ON CONFLICT DO NOTHING;
  `);

  // Seed orders
  pgm.sql(`
    INSERT INTO orders (user_id, status, total, delivery_address, notes) VALUES
      (4, 'pending', 27.98, '123 Main St, Apt 4B', 'Ring doorbell twice'),
      (5, 'cooking', 32.97, '456 Oak Ave', 'Leave at door'),
      (4, 'delivered', 18.98, '123 Main St, Apt 4B', NULL)
    ON CONFLICT DO NOTHING;
  `);

  // Seed order items
  pgm.sql(`
    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
      (1, 1, 1, 12.99),
      (1, 11, 1, 4.99),
      (1, 8, 2, 2.99),
      (2, 3, 1, 17.99),
      (2, 5, 1, 15.99),
      (2, 13, 1, 9.99),
      (2, 9, 1, 3.99),
      (3, 4, 1, 13.99),
      (3, 12, 1, 5.99)
    ON CONFLICT DO NOTHING;
  `);

  // Update order totals
  pgm.sql(`
    UPDATE orders SET total = (
      SELECT COALESCE(SUM(quantity * unit_price), 0)
      FROM order_items
      WHERE order_items.order_id = orders.id
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql('DELETE FROM order_items');
  pgm.sql('DELETE FROM orders');
  pgm.sql('DELETE FROM products');
  pgm.sql('DELETE FROM users');
};

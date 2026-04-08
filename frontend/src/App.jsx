import React, { useEffect, useState } from 'react';
import api from './api';

function App() {
  const [orders, setOrders] = useState([]);

  const getOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createOrder = async () => {
    try {
      await api.post('/orders', { user_id: 1 });
      getOrders();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>🚀 SwiftServe Orders</h1>
      <button onClick={createOrder}>➕ Create Order</button>
      <ul>
        {orders.map(order => (
          <li key={order.id}>
            Order #{order.id} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
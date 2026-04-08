import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import OrderCard from '../components/OrderCard';
import toast from 'react-hot-toast';
import { ShoppingCart, Trash2 } from 'lucide-react';

const CustomerMenu = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products').then((res) => res.data),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/products/categories').then((res) => res.data),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => api.get(`/orders?user_id=${user?.id}`).then((res) => res.data),
  });

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000');

    socket.on('order:status-changed', () => {
      queryClient.invalidateQueries(['orders']);
    });

    return () => socket.disconnect();
  }, [queryClient]);

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => api.post('/orders', orderData),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      setCart({});
      setShowCart(false);
      toast.success('Order placed successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to place order');
    },
  });

  const handleAddToCart = (product) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: { ...product, quantity: 1 },
    }));
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      });
    } else {
      setCart((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], quantity },
      }));
    }
  };

  const handlePlaceOrder = () => {
    const items = Object.values(cart).map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    createOrderMutation.mutate({
      user_id: user.id,
      items,
      delivery_address: '123 Main St, City, State 12345',
      notes: '',
    });
  };

  const cartTotal = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Menu</h1>
        <button
          onClick={() => setShowCart(!showCart)}
          className="relative p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600"
        >
          <ShoppingCart size={24} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-full ${
            selectedCategory === 'All'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === cat
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={handleAddToCart}
            quantity={cart[product.id]?.quantity || 0}
            onUpdateQuantity={handleUpdateQuantity}
          />
        ))}
      </div>

      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Cart</h2>
              <button onClick={() => setShowCart(false)}>Close</button>
            </div>

            {Object.keys(cart).length === 0 ? (
              <p className="text-gray-500 text-center py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {Object.values(cart).map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 bg-gray-100 rounded"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 bg-gray-100 rounded"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 0)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold mb-4">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={createOrderMutation.isPending}
                    className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300"
                  >
                    {createOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.slice(0, 6).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerMenu;

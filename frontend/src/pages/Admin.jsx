import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import api from '../api';
import OrderCard from '../components/OrderCard';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';
import { Package, ShoppingBag, Users, Plus, Edit2, Trash2 } from 'lucide-react';

const Admin = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('orders');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    available: true,
  });

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000');
    socket.emit('join:kitchen');

    socket.on('order:created', () => {
      queryClient.invalidateQueries(['orders']);
    });

    socket.on('order:status-changed', () => {
      queryClient.invalidateQueries(['orders']);
    });

    return () => socket.disconnect();
  }, [queryClient]);

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/api/orders').then((res) => res.data),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/api/products').then((res) => res.data),
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => api.get('/api/orders/drivers').then((res) => res.data),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/products/categories').then((res) => res.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/api/orders/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries(['orders']),
  });

  const assignDriverMutation = useMutation({
    mutationFn: ({ orderId, driverId }) => api.patch(`/api/orders/${orderId}/assign-driver`, { driver_id: driverId }),
    onSuccess: () => queryClient.invalidateQueries(['orders']),
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to assign driver'),
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => api.post('/api/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['categories']);
      setShowProductModal(false);
      setProductForm({ name: '', description: '', price: '', category: '', image_url: '', available: true });
      toast.success('Product created!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create product'),
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', category: '', image_url: '', available: true });
      toast.success('Product updated!');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product deleted!');
    },
  });

  const handleStatusChange = (orderId, status) => {
    updateStatusMutation.mutate({ id: orderId, status });
  };

  const handleAssignDriver = (orderId) => {
    const driverId = prompt('Enter driver ID:');
    if (driverId) {
      assignDriverMutation.mutate({ orderId: parseInt(orderId), driverId: parseInt(driverId) });
    }
  };

  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url || '',
      available: product.available,
    });
    setShowProductModal(true);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...productForm,
      price: parseFloat(productForm.price),
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    activeOrders: orders.filter((o) => ['confirmed', 'cooking', 'ready', 'en-route'].includes(o.status)).length,
    totalProducts: products.length,
    totalDrivers: drivers.length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-100 rounded-lg p-4">
          <p className="text-sm text-blue-600">Total Orders</p>
          <p className="text-2xl font-bold text-blue-800">{stats.totalOrders}</p>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4">
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.pendingOrders}</p>
        </div>
        <div className="bg-green-100 rounded-lg p-4">
          <p className="text-sm text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-800">{stats.activeOrders}</p>
        </div>
        <div className="bg-purple-100 rounded-lg p-4">
          <p className="text-sm text-purple-600">Products</p>
          <p className="text-2xl font-bold text-purple-800">{stats.totalProducts}</p>
        </div>
        <div className="bg-orange-100 rounded-lg p-4">
          <p className="text-sm text-orange-600">Drivers</p>
          <p className="text-2xl font-bold text-orange-800">{stats.totalDrivers}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b">
        {[
          { id: 'orders', label: 'Orders', icon: Package },
          { id: 'products', label: 'Products', icon: ShoppingBag },
          { id: 'drivers', label: 'Drivers', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 ${
              activeTab === tab.id
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              onAssignDriver={handleAssignDriver}
              showActions
            />
          ))}
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Product Management</h2>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductForm({ name: '', description: '', price: '', category: '', image_url: '', available: true });
                setShowProductModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEditProduct(product)}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this product?')) {
                        deleteProductMutation.mutate(product.id);
                      }
                    }}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver) => {
            const driverOrders = orders.filter(
              (o) => o.driver_id === driver.id && ['en-route'].includes(o.status)
            );
            return (
              <div key={driver.id} className="bg-white rounded-lg shadow p-4 border">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="font-semibold">{driver.name}</p>
                    <p className="text-sm text-gray-500">{driver.phone}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm">
                    Active deliveries: <span className="font-bold">{driverOrders.length}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    list="categories"
                    required
                  />
                  <datalist id="categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={productForm.available}
                  onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                />
                <span>Available</span>
              </label>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

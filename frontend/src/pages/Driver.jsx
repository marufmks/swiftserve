import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import OrderCard from '../components/OrderCard';
import toast from 'react-hot-toast';

const Driver = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/api/orders').then((res) => res.data),
    refetchInterval: 5000,
  });

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000');
    if (user?.id) {
      socket.emit('join:driver', user.id);
    }

    socket.on('order:assigned', (order) => {
      if (order.driver_id === user?.id) {
        queryClient.invalidateQueries(['orders']);
        toast.success(`New order #${order.id} assigned to you!`);
      }
    });

    return () => socket.disconnect();
  }, [user, queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/api/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      toast.success('Status updated!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to update status');
    },
  });

  const handleStatusChange = (orderId, status) => {
    updateStatusMutation.mutate({ id: orderId, status });
  };

  const myActiveOrders = orders.filter(
    (o) => o.driver_id === user?.id && ['confirmed', 'cooking', 'ready', 'en-route'].includes(o.status)
  );
  const availableForPickup = orders.filter((o) => o.status === 'ready' && !o.driver_id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Driver Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4 text-green-600">My Active Deliveries</h2>
          {myActiveOrders.length === 0 ? (
            <p className="text-gray-500 bg-gray-50 p-4 rounded-lg">No active deliveries</p>
          ) : (
            <div className="space-y-4">
              {myActiveOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  showActions
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 text-blue-600">Available for Pickup</h2>
          {availableForPickup.length === 0 ? (
            <p className="text-gray-500 bg-gray-50 p-4 rounded-lg">No orders available</p>
          ) : (
            <div className="space-y-4">
              {availableForPickup.map((order) => (
                <div key={order.id} className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
                  <p className="font-bold">Order #{order.id}</p>
                  <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                  <p className="font-semibold">Total: ${Number(order.total)?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Driver;

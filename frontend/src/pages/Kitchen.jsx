import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import api from '../api';
import OrderCard from '../components/OrderCard';
import toast from 'react-hot-toast';

const Kitchen = () => {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then((res) => res.data),
    refetchInterval: 5000,
  });

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000');
    socket.emit('join:kitchen');

    socket.on('order:created', () => {
      queryClient.invalidateQueries(['orders']);
      toast.success('New order received!');
    });

    socket.on('order:status-changed', () => {
      queryClient.invalidateQueries(['orders']);
    });

    return () => socket.disconnect();
  }, [queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to update status');
    },
  });

  const handleStatusChange = (orderId, status) => {
    updateStatusMutation.mutate({ id: orderId, status });
  };

  const pendingOrders = orders.filter((o) => ['pending', 'confirmed'].includes(o.status));
  const cookingOrders = orders.filter((o) => o.status === 'cooking');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  const StatusColumn = ({ title, count, orders, status, color }) => (
    <div className="flex-1 min-w-[300px]">
      <div className={`${color} rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-bold">
            {count}
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onStatusChange={status ? (id) => handleStatusChange(id, status) : handleStatusChange}
            showActions={!!status}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Kitchen Display System</h1>

      {isLoading ? (
        <p className="text-center">Loading orders...</p>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4">
          <StatusColumn
            title="New Orders"
            count={pendingOrders.length}
            orders={pendingOrders}
            status="confirmed"
            color="bg-blue-600"
          />
          <StatusColumn
            title="Cooking"
            count={cookingOrders.length}
            orders={cookingOrders}
            status="ready"
            color="bg-orange-600"
          />
          <StatusColumn
            title="Ready for Pickup"
            count={readyOrders.length}
            orders={readyOrders}
            color="bg-green-600"
          />
        </div>
      )}
    </div>
  );
};

export default Kitchen;

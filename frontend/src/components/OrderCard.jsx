import { Package, User, Clock, MapPin } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  cooking: 'bg-orange-100 text-orange-800 border-orange-300',
  ready: 'bg-green-100 text-green-800 border-green-300',
  'en-route': 'bg-purple-100 text-purple-800 border-purple-300',
  delivered: 'bg-gray-100 text-gray-800 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

const statusIcons = {
  pending: Clock,
  confirmed: Package,
  cooking: Package,
  ready: Package,
  'en-route': MapPin,
  delivered: User,
  cancelled: Package,
};

const OrderCard = ({ order, onStatusChange, onAssignDriver, showActions = false }) => {
  const StatusIcon = statusIcons[order.status] || Package;

  return (
    <div className={`border-2 rounded-lg p-4 transition-all ${statusColors[order.status]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <StatusIcon size={20} />
          <span className="font-bold">Order #{order.id}</span>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-semibold capitalize border">
          {order.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.quantity}x {item.product_name}
            </span>
            <span>${(item.quantity * item.unit_price).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 space-y-1 text-sm">
        {order.customer_name && (
          <div className="flex items-center space-x-2">
            <User size={14} />
            <span>{order.customer_name}</span>
          </div>
        )}
        {order.customer_phone && (
          <div className="flex items-center space-x-2">
            <span>{order.customer_phone}</span>
          </div>
        )}
        {order.delivery_address && (
          <div className="flex items-start space-x-2">
            <MapPin size={14} className="mt-0.5" />
            <span>{order.delivery_address}</span>
          </div>
        )}
        {order.notes && <p className="text-xs italic">Note: {order.notes}</p>}
        <div className="font-bold text-lg pt-2">Total: ${order.total?.toFixed(2)}</div>
      </div>

      {showActions && (
        <div className="mt-4 flex flex-wrap gap-2">
          {onStatusChange && (
            <>
              {order.status === 'pending' && (
                <button
                  onClick={() => onStatusChange(order.id, 'confirmed')}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Confirm
                </button>
              )}
              {order.status === 'confirmed' && (
                <button
                  onClick={() => onStatusChange(order.id, 'cooking')}
                  className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                >
                  Start Cooking
                </button>
              )}
              {order.status === 'cooking' && (
                <button
                  onClick={() => onStatusChange(order.id, 'ready')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Ready for Pickup
                </button>
              )}
              {order.status === 'ready' && (
                <button
                  onClick={() => onStatusChange(order.id, 'en-route')}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                >
                  Out for Delivery
                </button>
              )}
              {order.status === 'en-route' && (
                <button
                  onClick={() => onStatusChange(order.id, 'delivered')}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Mark Delivered
                </button>
              )}
            </>
          )}

          {onAssignDriver && order.status === 'pending' && (
            <button
              onClick={() => onAssignDriver(order.id)}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
            >
              Assign Driver
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;

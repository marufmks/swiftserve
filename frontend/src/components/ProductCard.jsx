import { Plus, Minus } from 'lucide-react';

const ProductCard = ({ product, onAdd, quantity = 0, onUpdateQuantity }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <span className="text-orange-600 font-bold">${product.price.toFixed(2)}</span>
        </div>
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        )}
        <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 mb-3">
          {product.category}
        </span>

        {onAdd && (
          <div className="flex items-center justify-between">
            {quantity > 0 ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <Minus size={16} />
                </button>
                <span className="font-semibold">{quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAdd(product)}
                disabled={!product.available}
                className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {product.available ? 'Add to Cart' : 'Unavailable'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

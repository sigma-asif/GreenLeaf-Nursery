import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CartProps {
  onNavigate: (page: string, plantId?: string) => void;
}

export default function Cart({ onNavigate }: CartProps) {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Add some plants to get started!</p>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Browse Plants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.plant.id}
                className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-6"
              >
                <img
                  src={item.plant.image_url || 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=200'}
                  alt={item.plant.name}
                  className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                  onClick={() => onNavigate('plant-details', item.plant.id)}
                />
                
                <div className="flex-1">
                  <h3
                    className="text-xl font-semibold text-gray-800 mb-1 cursor-pointer hover:text-green-600"
                    onClick={() => onNavigate('plant-details', item.plant.id)}
                  >
                    {item.plant.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{item.plant.category}</p>
                  <p className="text-2xl font-bold text-green-600">${item.plant.price}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.plant.id, item.quantity - 1)}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.plant.id, item.quantity + 1)}
                    disabled={item.quantity >= item.plant.stock}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800 mb-2">
                    ${(item.plant.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.plant.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-green-600">${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('checkout')}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition transform hover:scale-105"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => onNavigate('shop')}
                className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
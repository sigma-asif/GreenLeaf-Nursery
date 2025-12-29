import { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import type { Plant } from '../lib/supabase';

interface CheckoutProps {
  plantId: string | null;
  onNavigate: (page: string, plantId?: string) => void;
}

export default function Checkout({ plantId, onNavigate }: CheckoutProps) {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { items, clearCart } = useCart();
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    quantity: 1,
  });

  const checkoutItems = plantId && plant ? [{ plant, quantity: formData.quantity }] : items;

  useEffect(() => {
    if (plantId) {
      loadPlant();
    } else {
      setLoading(false);
    }
  }, [plantId]);

  const loadPlant = async () => {
    if (!plantId) return;
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('id', plantId)
        .maybeSingle();

      if (error) throw error;
      setPlant(data);
    } catch (error) {
      console.error('Error loading plant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (checkoutItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setSubmitting(true);

    try {
      for (const item of checkoutItems) {
        const totalAmount = item.plant.price * item.quantity;

        const { error: orderError } = await supabase.from('orders').insert({
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          shipping_address: formData.shippingAddress,
          plant_id: item.plant.id,
          plant_name: item.plant.name,
          plant_price: item.plant.price,
          quantity: item.quantity,
          total_amount: totalAmount,
          status: 'Pending',
        });

        if (orderError) throw orderError;

        const { error: stockError } = await supabase
          .from('plants')
          .update({ stock: item.plant.stock - item.quantity })
          .eq('id', item.plant.id);

        if (stockError) throw stockError;
      }

      if (!plantId) {
        clearCart();
      }
      
      setOrderPlaced(true);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!plantId && checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => onNavigate('shop')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  if (plantId && !plant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Plant not found</p>
          <button
            onClick={() => onNavigate('shop')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your order of {checkoutItems.length} item(s).
            We'll contact you at {formData.customerEmail} soon to arrange delivery.
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = checkoutItems.reduce((sum, item) => sum + item.plant.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => plantId ? onNavigate('plant-details', plantId) : onNavigate('cart')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to {plantId ? 'Plant' : 'Cart'}</span>
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  {checkoutItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 mb-4 pb-4 border-b last:border-b-0 last:mb-0 last:pb-0">
                      <img
                        src={item.plant.image_url || 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=200'}
                        alt={item.plant.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.plant.name}</h3>
                        <p className="text-gray-600 text-sm">${item.plant.price} × {item.quantity}</p>
                      </div>
                      <div className="font-semibold text-gray-800">
                        ${(item.plant.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between text-lg font-bold text-green-600">
                      <span>Total:</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Information</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Address *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.shippingAddress}
                      onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {plantId && plant && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={plant.stock}
                        required
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500 mt-1">{plant.stock} available</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Placing Order...' : 'Confirm Order'}
                  </button>

                  <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                    <CreditCard className="h-4 w-4" />
                    <span>Payment on delivery</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
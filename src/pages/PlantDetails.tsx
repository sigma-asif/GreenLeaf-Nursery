import { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingCart, PackageCheck, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import type { Plant } from '../lib/supabase';

interface PlantDetailsProps {
  plantId: string;
  onNavigate: (page: string, plantId?: string) => void;
}

export default function PlantDetails({ plantId, onNavigate }: PlantDetailsProps) {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    loadPlant();
  }, [plantId]);

  const loadPlant = async () => {
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

  const handleAddToCart = () => {
    if (plant && quantity > 0) {
      addToCart(plant, quantity);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Plant not found</p>
          <button
            onClick={() => onNavigate('home')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => onNavigate('shop')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Shop</span>
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div className="h-96 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={plant.image_url || 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={plant.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <div className="mb-4">
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {plant.category}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-800 mb-4">{plant.name}</h1>

              <div className="text-3xl font-bold text-green-600 mb-6">${plant.price}</div>

              <div className="flex items-center space-x-2 mb-6">
                <PackageCheck className={`h-5 w-5 ${plant.stock > 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`font-medium ${plant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {plant.stock > 0 ? `${plant.stock} Available` : 'Out of Stock'}
                </span>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Description</h2>
                <p className="text-gray-600 leading-relaxed">{plant.description}</p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Care Information</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{plant.care_info}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={plant.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(plant.stock, parseInt(e.target.value) || 1)))}
                  disabled={plant.stock === 0}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={plant.stock === 0}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 rounded-lg font-semibold text-lg transition ${
                    plant.stock > 0
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="h-6 w-6" />
                  <span>Add to Cart</span>
                </button>
                
                <button
                  onClick={() => onNavigate('checkout', plant.id)}
                  disabled={plant.stock === 0}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 rounded-lg font-semibold text-lg transition ${
                    plant.stock > 0
                      ? 'bg-gray-800 text-white hover:bg-gray-900'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span>Buy Now</span>
                </button>
              </div>

              {showSuccess && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-center font-medium animate-pulse">
                  ✓ Added to cart successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
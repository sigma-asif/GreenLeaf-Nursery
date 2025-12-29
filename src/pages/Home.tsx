import { useEffect, useState } from 'react';
import { Sprout, Leaf, TruckIcon, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Plant } from '../lib/supabase';

interface HomeProps {
  onNavigate: (page: string, plantId?: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [featuredPlants, setFeaturedPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedPlants();
  }, []);

  const loadFeaturedPlants = async () => {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('is_featured', true)
        .limit(3);

      if (error) throw error;
      setFeaturedPlants(data || []);
    } catch (error) {
      console.error('Error loading featured plants:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        className="relative bg-gradient-to-br from-green-50 to-emerald-100 py-20 px-4"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-white/75"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Welcome to GreenLeaf Nursery
          </h1>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Discover our beautiful collection of plants to transform your space into a green paradise.
            From indoor beauties to outdoor wonders, we have everything you need.
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transform hover:scale-105 transition shadow-lg"
          >
            Shop Now
          </button>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fresh Plants</h3>
              <p className="text-gray-600">Healthy, vibrant plants delivered fresh</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Expert Care</h3>
              <p className="text-gray-600">Detailed care instructions included</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and safe delivery to your door</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">100% satisfaction guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Featured Plants
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
            </div>
          ) : featuredPlants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No featured plants available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPlants.map((plant) => (
                <div
                  key={plant.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer transform hover:-translate-y-1"
                  onClick={() => onNavigate('plant-details', plant.id)}
                >
                  <div className="h-64 bg-gray-200 overflow-hidden">
                    <img
                      src={plant.image_url || 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=600'}
                      alt={plant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{plant.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{plant.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-600">${plant.price}</span>
                      <span className="text-sm text-gray-500">{plant.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('shop')}
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
            >
              View All Plants
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

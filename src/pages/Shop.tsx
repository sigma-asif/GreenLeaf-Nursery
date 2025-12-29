import { useEffect, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import type { Plant } from '../lib/supabase';

interface ShopProps {
  onNavigate: (page: string, plantId?: string) => void;
}

export default function Shop({ onNavigate }: ShopProps) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const { addToCart } = useCart();

  useEffect(() => {
    loadPlants();
  }, []);

  useEffect(() => {
    filterPlants();
  }, [searchTerm, selectedCategory, plants]);

  const loadPlants = async () => {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlants(data || []);

      const uniqueCategories = ['All', ...new Set(data?.map(p => p.category) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading plants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPlants = () => {
    let filtered = plants;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPlants(filtered);
  };

  const handleAddToCart = (e: React.MouseEvent, plant: Plant) => {
    e.stopPropagation();
    addToCart(plant, 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Our Plant Collection</h1>

        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No plants found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlants.map((plant) => (
              <div
                key={plant.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer transform hover:-translate-y-1"
                onClick={() => onNavigate('plant-details', plant.id)}
              >
                <div className="h-56 bg-gray-200 overflow-hidden">
                  <img
                    src={plant.image_url || 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={plant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{plant.name}</h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {plant.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{plant.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-green-600">${plant.price}</span>
                    <button
                      onClick={(e) => handleAddToCart(e, plant)}
                      disabled={plant.stock === 0}
                      className={`p-2 rounded-lg transition ${
                        plant.stock > 0
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      title={plant.stock > 0 ? 'Add to cart' : 'Out of stock'}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-2">
                    <span className={`text-sm ${plant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {plant.stock > 0 ? `${plant.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
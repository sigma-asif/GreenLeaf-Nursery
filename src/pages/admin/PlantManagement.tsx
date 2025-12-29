import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Plant } from '../../lib/supabase';

interface PlantManagementProps {
  onNavigate: (page: string) => void;
}

export default function PlantManagement({ onNavigate }: PlantManagementProps) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    care_info: '',
    price: '',
    category: '',
    stock: '',
    image_url: '',
    is_featured: false,
  });

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlants(data || []);
    } catch (error) {
      console.error('Error loading plants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const plantData = {
        name: formData.name,
        description: formData.description,
        care_info: formData.care_info,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        image_url: formData.image_url || null,
        is_featured: formData.is_featured,
      };

      if (editingPlant) {
        const { error } = await supabase
          .from('plants')
          .update(plantData)
          .eq('id', editingPlant.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('plants').insert(plantData);
        if (error) throw error;
      }

      resetForm();
      loadPlants();
    } catch (error) {
      console.error('Error saving plant:', error);
      alert('Failed to save plant');
    }
  };

  const handleEdit = (plant: Plant) => {
    setEditingPlant(plant);
    setFormData({
      name: plant.name,
      description: plant.description,
      care_info: plant.care_info,
      price: plant.price.toString(),
      category: plant.category,
      stock: plant.stock.toString(),
      image_url: plant.image_url || '',
      is_featured: plant.is_featured,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plant?')) return;

    try {
      const { error } = await supabase.from('plants').delete().eq('id', id);
      if (error) throw error;
      loadPlants();
    } catch (error) {
      console.error('Error deleting plant:', error);
      alert('Failed to delete plant');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      care_info: '',
      price: '',
      category: '',
      stock: '',
      image_url: '',
      is_featured: false,
    });
    setEditingPlant(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Plant Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <Plus className="h-5 w-5" />
          <span>Add Plant</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editingPlant ? 'Edit Plant' : 'Add New Plant'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Indoor, Outdoor, Succulents"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/plant-image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Care Information *</label>
              <textarea
                required
                rows={3}
                value={formData.care_info}
                onChange={(e) => setFormData({ ...formData, care_info: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Featured Plant</span>
              </label>
            </div>

            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                {editingPlant ? 'Update Plant' : 'Add Plant'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {plants.map((plant) => (
                <tr key={plant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img
                        src={plant.image_url || 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=100'}
                        alt={plant.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{plant.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{plant.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      {plant.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                    ${plant.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`flex items-center space-x-1 ${plant.stock < 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {plant.stock < 5 && <AlertTriangle className="h-4 w-4" />}
                      <span>{plant.stock}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {plant.is_featured ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(plant)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(plant.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

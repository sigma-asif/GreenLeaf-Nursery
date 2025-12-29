import { useEffect, useState } from 'react';
import { Package, ShoppingCart, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  lowStockPlants: number;
  unreadMessages: number;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    lowStockPlants: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [ordersRes, plantsRes, messagesRes] = await Promise.all([
        supabase.from('orders').select('status'),
        supabase.from('plants').select('stock'),
        supabase.from('contact_messages').select('is_read'),
      ]);

      const orders = ordersRes.data || [];
      const plants = plantsRes.data || [];
      const messages = messagesRes.data || [];

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'Pending').length,
        deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
        lowStockPlants: plants.filter(p => p.stock < 5).length,
        unreadMessages: messages.filter(m => !m.is_read).length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer" onClick={() => onNavigate('admin-orders')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer" onClick={() => onNavigate('admin-orders')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Pending Orders</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer" onClick={() => onNavigate('admin-orders')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Delivered Orders</p>
              <p className="text-3xl font-bold text-green-600">{stats.deliveredOrders}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer" onClick={() => onNavigate('admin-plants')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Low Stock Alerts</p>
              <p className="text-3xl font-bold text-red-600">{stats.lowStockPlants}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer" onClick={() => onNavigate('admin-messages')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Unread Messages</p>
              <p className="text-3xl font-bold text-purple-600">{stats.unreadMessages}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('admin-plants')}
            className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Manage Plants
          </button>
          <button
            onClick={() => onNavigate('admin-orders')}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            View Orders
          </button>
          <button
            onClick={() => onNavigate('admin-messages')}
            className="bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            View Messages
          </button>
        </div>
      </div>
    </div>
  );
}

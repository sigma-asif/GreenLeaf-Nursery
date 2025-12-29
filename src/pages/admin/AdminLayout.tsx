import { LayoutDashboard, Leaf, ShoppingCart, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function AdminLayout({ children, currentPage, onNavigate }: AdminLayoutProps) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      onNavigate('login');
    }
  }, [user, loading, onNavigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    { id: 'admin', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-plants', label: 'Plants', icon: Leaf },
    { id: 'admin-orders', label: 'Orders', icon: ShoppingCart },
    { id: 'admin-messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen sticky top-16 flex-shrink-0">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Panel</h2>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-green-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content - FIXED: Added min-w-0 to prevent flex overflow issues */}
        <main className="flex-1 min-w-0 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
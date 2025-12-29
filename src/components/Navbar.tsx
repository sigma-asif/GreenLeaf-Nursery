import { Sprout, ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, signOut } = useAuth();
  const { getTotalItems } = useCart();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <Sprout className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-800">GreenLeaf Nursery</span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => onNavigate('home')}
              className={`text-gray-700 hover:text-green-600 font-medium transition ${
                currentPage === 'home' ? 'text-green-600' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className={`text-gray-700 hover:text-green-600 font-medium transition ${
                currentPage === 'shop' || currentPage === 'plant-details' || currentPage === 'checkout' ? 'text-green-600' : ''
              }`}
            >
              Shop
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`text-gray-700 hover:text-green-600 font-medium transition ${
                currentPage === 'contact' ? 'text-green-600' : ''
              }`}
            >
              Contact
            </button>

            {/* Cart Icon with Badge */}
            <button
              onClick={() => onNavigate('cart')}
              className={`relative p-2 text-gray-700 hover:text-green-600 transition ${
                currentPage === 'cart' ? 'text-green-600' : ''
              }`}
            >
              <ShoppingCart className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {user ? (
              <>
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center space-x-1 text-gray-700 hover:text-green-600 font-medium transition ${
                    currentPage.startsWith('admin') ? 'text-green-600' : ''
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>Admin</span>
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 font-medium transition"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className={`flex items-center space-x-1 text-gray-700 hover:text-green-600 font-medium transition ${
                  currentPage === 'login' ? 'text-green-600' : ''
                }`}
              >
                <User className="h-5 w-5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
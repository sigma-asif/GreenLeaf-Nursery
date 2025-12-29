import { useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import PlantDetails from './pages/PlantDetails';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Cart from './pages/Cart';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import PlantManagement from './pages/admin/PlantManagement';
import OrderManagement from './pages/admin/OrderManagement';
import Messages from './pages/admin/Messages';

type Page = 'home' | 'shop' | 'plant-details' | 'cart' | 'checkout' | 'contact' | 'login' | 'admin' | 'admin-plants' | 'admin-orders' | 'admin-messages';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    
    if (path.startsWith('/plant/')) {
      const plantId = path.split('/plant/')[1];
      setCurrentPage('plant-details');
      setSelectedPlantId(plantId);
    } else if (path === '/shop') {
      setCurrentPage('shop');
    } else if (path === '/cart') {
      setCurrentPage('cart');
    } else if (path === '/checkout') {
      setCurrentPage('checkout');
      setSelectedPlantId(null);
    } else if (path.startsWith('/checkout/')) {
      const plantId = path.split('/checkout/')[1];
      setCurrentPage('checkout');
      setSelectedPlantId(plantId);
    } else if (path === '/contact') {
      setCurrentPage('contact');
    } else if (path === '/login') {
      setCurrentPage('login');
    } else if (path === '/admin') {
      setCurrentPage('admin');
    } else if (path === '/admin/plants') {
      setCurrentPage('admin-plants');
    } else if (path === '/admin/orders') {
      setCurrentPage('admin-orders');
    } else if (path === '/admin/messages') {
      setCurrentPage('admin-messages');
    } else {
      setCurrentPage('home');
      setSelectedPlantId(null);
    }
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        setCurrentPage(event.state.page || 'home');
        setSelectedPlantId(event.state.plantId || null);
      } else {
        setCurrentPage('home');
        setSelectedPlantId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (page: string, plantId?: string) => {
    let url = '/';
    
    switch (page) {
      case 'home':
        url = '/';
        break;
      case 'shop':
        url = '/shop';
        break;
      case 'plant-details':
        url = plantId ? `/plant/${plantId}` : '/shop';
        break;
      case 'cart':
        url = '/cart';
        break;
      case 'checkout':
        url = plantId ? `/checkout/${plantId}` : '/checkout';
        break;
      case 'contact':
        url = '/contact';
        break;
      case 'login':
        url = '/login';
        break;
      case 'admin':
        url = '/admin';
        break;
      case 'admin-plants':
        url = '/admin/plants';
        break;
      case 'admin-orders':
        url = '/admin/orders';
        break;
      case 'admin-messages':
        url = '/admin/messages';
        break;
      default:
        url = '/';
    }

    window.history.pushState({ page, plantId: plantId || null }, '', url);
    setCurrentPage(page as Page);
    setSelectedPlantId(plantId || null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigate} />;
      case 'shop':
        return <Shop onNavigate={navigate} />;
      case 'plant-details':
        return selectedPlantId ? (
          <PlantDetails plantId={selectedPlantId} onNavigate={navigate} />
        ) : (
          <Shop onNavigate={navigate} />
        );
      case 'cart':
        return <Cart onNavigate={navigate} />;
      case 'checkout':
        return <Checkout plantId={selectedPlantId} onNavigate={navigate} />;
      case 'contact':
        return <Contact onNavigate={navigate} />;
      case 'login':
        return <Login onNavigate={navigate} />;
      case 'admin':
        return (
          <AdminLayout currentPage={currentPage} onNavigate={navigate}>
            <Dashboard onNavigate={navigate} />
          </AdminLayout>
        );
      case 'admin-plants':
        return (
          <AdminLayout currentPage={currentPage} onNavigate={navigate}>
            <PlantManagement onNavigate={navigate} />
          </AdminLayout>
        );
      case 'admin-orders':
        return (
          <AdminLayout currentPage={currentPage} onNavigate={navigate}>
            <OrderManagement onNavigate={navigate} />
          </AdminLayout>
        );
      case 'admin-messages':
        return (
          <AdminLayout currentPage={currentPage} onNavigate={navigate}>
            <Messages onNavigate={navigate} />
          </AdminLayout>
        );
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          {currentPage !== 'login' && <Navbar currentPage={currentPage} onNavigate={navigate} />}
          {renderPage()}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
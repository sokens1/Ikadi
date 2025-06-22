
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  MapPin, 
  BarChart3, 
  MessageSquare, 
  Calendar,
  LogOut,
  Menu
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  const menuItems = [
    { icon: Home, label: 'Tableau de Bord', path: '/dashboard' },
    { icon: Calendar, label: 'Gestion des Élections', path: '/elections' },
    { icon: MapPin, label: 'Centres & Bureaux', path: '/centers' },
    { icon: Users, label: 'Gestion Utilisateurs', path: '/users' },
    { icon: BarChart3, label: 'Centralisation Résultats', path: '/results' },
    { icon: MessageSquare, label: 'Conversations', path: '/conversations' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Sur mobile, fermer automatiquement la sidebar
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-gov-gray-light flex w-full overflow-hidden">
      {/* Sidebar */}
      <div className={`${
        isMobile 
          ? sidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-64' : 'hidden'
          : sidebarOpen ? 'w-64' : 'w-16'
      } transition-all duration-300 gov-bg-primary text-white flex flex-col`}>
        <div className="p-3 sm:p-4 border-b border-gov-blue-light">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-gov-blue font-bold text-sm">eW</span>
            </div>
            {(sidebarOpen || isMobile) && (
              <div className="min-w-0">
                <h1 className="font-bold text-lg truncate">eWana</h1>
                <p className="text-xs text-blue-200 truncate">Gestion Électorale</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-2 sm:p-4 min-h-0 overflow-y-auto">
          <ul className="space-y-1 sm:space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`flex items-center space-x-3 p-2 sm:p-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-white text-gov-blue'
                      : 'text-blue-100 hover:bg-gov-blue-light'
                  }`}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {(sidebarOpen || isMobile) && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-2 sm:p-4 border-t border-gov-blue-light">
          {(sidebarOpen || isMobile) && (
            <div className="mb-3">
              <p className="text-blue-100 text-sm font-medium truncate">{user?.name}</p>
              <p className="text-blue-200 text-xs truncate capitalize">
                {user?.role?.replace('-', ' ')}
              </p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-blue-100 hover:bg-gov-blue-light w-full justify-start"
          >
            <LogOut size={16} className="flex-shrink-0" />
            {(sidebarOpen || isMobile) && <span className="ml-2 truncate">Déconnexion</span>}
          </Button>
        </div>
      </div>

      {/* Overlay pour mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="ghost"
              size="sm"
              className="text-gov-gray"
            >
              <Menu size={20} />
            </Button>
            
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <div className="text-right min-w-0 hidden sm:block">
                <p className="font-medium text-gov-gray text-sm truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize truncate">
                  {user?.role?.replace('-', ' ')}
                </p>
              </div>
              <div className="w-8 h-8 bg-gov-blue rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-sm">
                  {user?.name?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-6 overflow-auto min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

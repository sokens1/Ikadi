
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

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  return (
    <div className="min-h-screen bg-gov-gray-light flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 gov-bg-primary text-white flex flex-col`}>
        <div className="p-4 border-b border-gov-blue-light">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-gov-blue font-bold text-sm">eW</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">eWana</h1>
                <p className="text-xs text-blue-200">Gestion Électorale</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-white text-gov-blue'
                      : 'text-blue-100 hover:bg-gov-blue-light'
                  }`}
                >
                  <item.icon size={20} />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gov-blue-light">
          {sidebarOpen && (
            <div className="mb-3">
              <p className="text-blue-100 text-sm font-medium">{user?.name}</p>
              <p className="text-blue-200 text-xs">{user?.role}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-blue-100 hover:bg-gov-blue-light w-full justify-start"
          >
            <LogOut size={16} />
            {sidebarOpen && <span className="ml-2">Déconnexion</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="ghost"
              size="sm"
              className="text-gov-gray"
            >
              <Menu size={20} />
            </Button>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-gov-gray">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role?.replace('-', ' ')}</p>
              </div>
              <div className="w-8 h-8 bg-gov-blue rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.name?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

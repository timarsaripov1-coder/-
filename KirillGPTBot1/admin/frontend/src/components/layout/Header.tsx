import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { 
  Menu, 
  X, 
  Bell, 
  Settings, 
  LogOut, 
  User,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface HeaderProps {
  onMenuClick: () => void;
  isMobileMenuOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, isMobileMenuOpen }) => {
  const { logout } = useAuth();
  const { isConnected } = useWebSocket();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Mobile menu button and title */}
        <div className="flex items-center">
          <button
            type="button"
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={onMenuClick}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <X className="block h-6 w-6" />
            ) : (
              <Menu className="block h-6 w-6" />
            )}
          </button>
          
          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl font-semibold text-gray-900">
              Kirill GPT Admin
            </h1>
          </div>
        </div>

        {/* Right side - Status and user menu */}
        <div className="flex items-center space-x-4">
          {/* Connection status */}
          <div className="flex items-center">
            {isConnected() ? (
              <div className="flex items-center text-success-600">
                <Wifi className="h-4 w-4 mr-1" />
                <span className="text-sm hidden sm:inline">Connected</span>
              </div>
            ) : (
              <div className="flex items-center text-danger-600">
                <WifiOff className="h-4 w-4 mr-1" />
                <span className="text-sm hidden sm:inline">Disconnected</span>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
            <Bell className="h-5 w-5" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <User className="h-5 w-5" />
              <span className="ml-2 text-sm text-gray-700 hidden sm:inline">Admin</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </button>
                  <hr className="my-1" />
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMenuClick}
        />
      )}
    </header>
  );
};
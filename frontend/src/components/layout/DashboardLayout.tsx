'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Users, 
  Settings, 
  BarChart3, 
  Webhook,
  Menu,
  X,
  LogOut,
  User,
  BookOpen,
  Bell,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: BarChart3, badge: null },
  { name: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare, badge: '12' },
  { name: 'Knowledge Base', href: '/dashboard/knowledge', icon: BookOpen, badge: null },
  { name: 'Customers', href: '/dashboard/customers', icon: Users, badge: null },
  { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook, badge: null },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, badge: null },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 flex z-40 md:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-white/10 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">WhatsApp AI</span>
                <p className="text-xs text-gray-500">Smart Assistant</p>
              </div>
            </div>
            <nav className="mt-8 px-2 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                      'group flex items-center justify-between px-3 py-3 text-base font-medium rounded-xl transition-all duration-200'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="flex items-center">
                      <item.icon
                        className={cn(
                          isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600',
                          'mr-3 h-5 w-5'
                        )}
                      />
                      {item.name}
                    </div>
                    {item.badge && (
                      <span className={cn(
                        isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600',
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-800">{user?.businessName || 'Business User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col h-0 flex-1 bg-white shadow-xl border-r border-gray-100">
            <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-7 w-7 text-white" />
                </div>
                <div className="ml-4">
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">WhatsApp AI</span>
                  <p className="text-sm text-gray-500">Smart Assistant Platform</p>
                </div>
              </div>
              
              {/* Search bar */}
              <div className="px-6 mt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              
              <nav className="mt-8 flex-1 px-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        isActive
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg scale-105'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        'group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-102'
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon
                          className={cn(
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600',
                            'mr-3 h-5 w-5'
                          )}
                        />
                        {item.name}
                      </div>
                      {item.badge && (
                        <span className={cn(
                          isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600',
                          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold'
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex-shrink-0 border-t border-gray-100 p-6">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center shadow-md">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user?.businessName || 'Business User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden bg-white shadow-sm border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 text-lg font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">WhatsApp AI</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600"
            >
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-gray-50">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
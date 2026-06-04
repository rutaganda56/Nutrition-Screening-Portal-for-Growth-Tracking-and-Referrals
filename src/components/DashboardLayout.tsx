import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  Send,
  Bell,
  FileText,
  User,
  Settings,
  LogOut,
  Heart,
  Menu,
  X,
  ClipboardCheck,
  Home,
} from 'lucide-react';
import { NotificationSystem } from "@/app/components/NotificationSystem";

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const doctorSidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Send, label: 'Service Request Queue', path: '/dashboard/service-request-queue' },
  { icon: FileText, label: 'Reports', path: '/dashboard/reports' },
  { icon: User, label: 'Profile', path: '/dashboard/profile' }
];

const chwSidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Patient Registration', path: '/dashboard/patient-registration' },
  { icon: ClipboardCheck, label: 'Screening Form', path: '/dashboard/new-screening' },
  { icon: FileText, label: 'Patient History', path: '/dashboard/patient-history' },
  { icon: User, label: 'Profile', path: '/dashboard/profile' }
];

const adminSidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'System Overview', path: '/dashboard' },
  { icon: Home, label: 'Health Center Management', path: '/dashboard/facilities' },
  { icon: Users, label: 'User Management', path: '/dashboard/user-management' },
  { icon: FileText, label: 'Reports & Analytics', path: '/dashboard/analytics' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' }
];

const getSidebarItems = (role: UserRole): SidebarItem[] => {
  switch (role) {
    case 'doctor':
      return doctorSidebarItems;
    case 'communityhealthworker':
      return chwSidebarItems;
    case 'administrator':
      return adminSidebarItems;
    default:
      return [];
  }
};

const canAccessSettings = (role: UserRole) => role === 'administrator';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePath, setActivePath] = useState('/dashboard');

  if (!user) {
    navigate('/login');
    return null;
  }

  const sidebarItems = getSidebarItems(user.role);

  const handleNavigation = (path: string) => {
    setActivePath(path);
    navigate(path);
    setSidebarOpen(false);
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'doctor':
        return 'Doctor';
      case 'communityhealthworker':
        return 'Community Health Worker';
      case 'administrator':
        return 'Administrator';
    }
  };

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900">Nutri Track</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationSystem />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback className="bg-green-600 text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">{getRoleDisplayName(user.role)}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {canAccessSettings(user.role) && (
                  <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); navigate('/'); }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-30
            w-64 bg-white border-r
            transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}\
            top-16 lg:top-0
          `}
        >
          <div className="flex flex-col h-full">
            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activePath === item.path;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-colors text-left
                      ${isActive 
                        ? 'bg-green-50 text-green-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            
            {/* Logout Button at Bottom */}
            <div className="p-4 border-t">
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

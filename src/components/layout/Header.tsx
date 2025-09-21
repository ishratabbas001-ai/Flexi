import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import PWAStatus from '@/components/pwa/PWAStatus';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Moon, LogOut, Settings, Menu, 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText,
  GraduationCap,
  DollarSign,
  BarChart3,
  UserPlus,
  SunMedium,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Schools', path: '/admin/schools' },
    { icon: CreditCard, label: 'Applications', path: '/admin/applications' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const schoolMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/school' },
    { icon: GraduationCap, label: 'Students', path: '/students' },
    { icon: UserPlus, label: 'Enrollment', path: '/school/enrollment' },
    { icon: CreditCard, label: 'BNPL Plans', path: '/school/bnpl-plans' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/school/settings' },
  ];

  const parentMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/parent' },
    { icon: CreditCard, label: 'BNPL Application', path: '/bnpl/apply' },
    { icon: DollarSign, label: 'Payments', path: '/parent/payments' },
    { icon: FileText, label: 'Payment History', path: '/parent/history' },
    { icon: Settings, label: 'Settings', path: '/parent/settings' },
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminMenuItems;
      case 'school':
        return schoolMenuItems;
      case 'parent':
        return parentMenuItems;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const handleSettingsClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin/settings');
    } else if (user?.role === 'school') {
      navigate('/admin/settings'); // Schools use the same settings page as admin
    } else if (user?.role === 'parent') {
      navigate('/admin/settings'); // For now, parents also use the same settings page
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-top">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <Menu className="absolute h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    {user?.role === 'admin' && 'Admin Panel'}
                    {user?.role === 'school' && 'School Management'}
                    {user?.role === 'parent' && 'Parent Portal'}
                  </h2>
                  <div className="space-y-1">
                    {menuItems.map((item) => (
                      <Button
                        key={item.path}
                        variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start',
                          location.pathname === item.path && 'bg-secondary'
                        )}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold hidden xs:block">FlexiFee</h1>
          </div>
        </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            className="border-2"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <SunMedium className="absolute h-4 w-4 rotate-0 scale-100 transition-all stroke-[2.5] text-black dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all stroke-[2] dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="absolute h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-5 w-5 sm:h-10 sm:w-10 rounded-full flex items-center justify-center">
                <User className="absolute h-5 w-5 sm:h-5 sm:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mr-4" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name}</p>
                  <p className="w-[180px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
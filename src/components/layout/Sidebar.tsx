import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText, 
  Settings,
  GraduationCap,
  DollarSign,
  BarChart3,
  UserPlus
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <div className="fixed left-0 top-16 z-40 w-64 h-[calc(100vh-4rem)] border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden sm:block">
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
                onClick={() => navigate(item.path)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
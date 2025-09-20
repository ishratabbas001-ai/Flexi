import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-3 sm:p-6 ml-0 sm:ml-64 mt-16 pb-20 sm:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
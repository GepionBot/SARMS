import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:ml-64 min-h-screen">
        <main className="p-4 lg:p-6 pt-16 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

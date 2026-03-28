import Sidebar from 'components/ui/Sidebar';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
 // Check your relative path!

const EmployeeDashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar stays fixed on the left */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
      />
      
      {/* Main content area that changes when you click links */}
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pb-20 lg:pb-0`}>
        <div className="p-4 lg:p-8">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboardLayout;

import Sidebar from 'components/ui/Sidebar';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
 // Ensure this relative path is correct!

const EmployeeDashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* 1. Sidebar stays on the left */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
      />
      
      {/* 2. Main content area adjusts based on Sidebar width */}
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pb-16 lg:pb-0`}>
        <div className="p-4 lg:p-8">
          {/* 3. This is where LeaveForm and PayrollPage will appear */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboardLayout;
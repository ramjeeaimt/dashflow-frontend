import React, { useState } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';

import JobsTab from '../components/JobsTab';
import ApplicationsTab from '../components/ApplicationsTab';
// import MessagesTab from '../components/MessagesTab';
import ApiDocsTab from '../components/ApiDocsTab';

export default function JobPostPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs');

  const tabs = [
    { id: 'jobs', label: 'Job Postings', icon: 'Briefcase' },
    { id: 'applications', label: 'Applications', icon: 'ClipboardList' },
    // { id: 'messages', label: 'Messages', icon: 'MessageSquare' },
    // { id: 'apidocs', label: 'API Docs', icon: 'Code' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 flex-1 flex flex-col`}>
        <div className="px-6 py-6 max-w-[1600px] w-full mx-auto flex-1 flex flex-col">
            
          {/* Header & Tabs */}
          <div className="mb-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Icon name="LayoutDashboard" size={14} />
              <span>Dashboard</span>
              <Icon name="ChevronRight" size={12} />
              <span className="text-gray-700 font-medium">Difmo Jobs Hub</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-6">Jobs Hub</h1>

            {/* Tab Navigation */}
            <div className="flex bg-white/50 p-1 rounded-xl w-fit border border-gray-200 backdrop-blur-sm shadow-sm">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === t.id
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-100 ring-1 ring-black/5'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                  }`}
                >
                  <Icon name={t.icon} size={16} className={activeTab === t.id ? 'text-blue-600' : 'text-gray-400'} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Content Area */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden p-1">
                {activeTab === 'jobs' && <JobsTab setActiveTab={setActiveTab} />}
                {activeTab === 'applications' && <ApplicationsTab />}
                {/* {activeTab === 'messages' && <MessagesTab />} */}
                {activeTab === 'apidocs' && <ApiDocsTab />}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
import React, { useState } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import CompanyDetails from '../components/CompanyDetails';
import DepartmentManager from '../components/DepartmentManager';
import ManagerList from '../components/ManagerList';
import Icon from '../../../components/AppIcon';
import ComanyDocsGST from '../components/CompanyDOcsGST';
import AttendancePolicySettings from '../components/AttendancePolicySettings';
import RewardSystemSettings from '../components/RewardSystemSettings';

const CompanyProfile = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Settings', path: '#' },
        { label: 'Company Profile', path: '/company-profile' }
    ];

    const tabs = [
        { id: 'details', label: 'General Information', icon: 'Building', description: 'View and update your company details' },
        { id: 'departments', label: 'Departments', icon: 'Layers', description: 'Organize your team structure' },
        { id: 'managers', label: 'Managers', icon: 'Users', description: 'Manage administrators and leads' },
        { id: 'GST', label: 'Compliance & Docs', icon: 'FileText', description: 'GST, tax and legal documentation' },
        { id: 'attendance-policy', label: 'Attendance Policy', icon: 'Clock', description: 'Late marking, check-in windows, and half-day rules' },
        { id: 'rewards', label: 'Reward System', icon: 'Star', description: 'Configure employee point-based rewards' },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Header onToggleSidebar={() => setIsMobileSidebarOpen(true)} />
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />

            <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
                } pt-16 pb-8`}>
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <BreadcrumbNavigation items={breadcrumbItems} />
                        <div className="mt-4">
                            <h1 className="text-2xl font-bold text-slate-900">Organization Settings</h1>
                            <p className="text-slate-500 mt-1">Manage your company's identity, team structure, and legal compliance.</p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Internal Sidebar */}
                        <aside className="lg:w-64 flex-shrink-0">
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === tab.id
                                            ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <Icon name={tab.icon} size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'} />
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* Content Area */}
                        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="border-b border-slate-100 px-8 py-6">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {tabs.find(t => t.id === activeTab)?.label}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    {tabs.find(t => t.id === activeTab)?.description}
                                </p>
                            </div>

                            <div className="p-8">
                                {activeTab === 'details' && <CompanyDetails />}
                                {activeTab === 'departments' && <DepartmentManager />}
                                {activeTab === 'managers' && <ManagerList />}
                                {activeTab === 'GST' && <ComanyDocsGST />}
                                {activeTab === 'attendance-policy' && <AttendancePolicySettings />}
                                {activeTab === 'rewards' && <RewardSystemSettings />}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CompanyProfile;

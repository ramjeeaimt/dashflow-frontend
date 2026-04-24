import React, { useState } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import CompanyDetails from '../components/CompanyDetails';
import DepartmentManager from '../components/DepartmentManager';
import ManagerList from '../components/ManagerList';
import Icon from '../../../components/AppIcon';
import ComanyDocsGST from '../components/CompanyDOcsGST';

const CompanyProfile = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Company Profile', path: '/company-profile' }
    ];

    const tabs = [
        { id: 'details', label: 'Company Details', icon: 'Building' },
        { id: 'departments', label: 'Departments', icon: 'Layers' },
        { id: 'managers', label: 'Managers', icon: 'Users' },
        { id: 'GST', label: 'CompanyDocsGst', icon: 'CompanyDocs' }
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header onToggleSidebar={() => setIsMobileSidebarOpen(true)} />
            <Sidebar 
                isCollapsed={sidebarCollapsed} 
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />

            <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-8`}>
                <div className="px-4 sm:px-6 md:px-8">
                    <BreadcrumbNavigation items={breadcrumbItems} />

                    <div className="mb-8">
                        <h1 className="text-3xl font-semibold text-foreground mb-2">Company Profile</h1>
                        <p className="text-muted-foreground">
                            Manage your company information, departments, and administrators.
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                        <div className="border-b border-border">
                            <nav className="flex space-x-8 px-6 overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 py-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <Icon name={tab.icon} size={16} />
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-6">
                            {activeTab === 'details' && <CompanyDetails />}
                            {activeTab === 'departments' && <DepartmentManager />}
                            {activeTab === 'managers' && <ManagerList />}
                            {activeTab === 'GST' && <ComanyDocsGST />}

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CompanyProfile;

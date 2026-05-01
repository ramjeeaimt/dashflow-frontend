import React, { useEffect, useState } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import authService from '../../../services/auth.service';
import useAuthStore from '../../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const MyCompaniesPage = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { user, switchCompany } = useAuthStore();
    const navigate = useNavigate();

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const data = await authService.getMyWorkspaces();
                console.log('[MyCompaniesPage] Fetched workspaces:', data);
                setCompanies(data);
            } catch (error) {
                console.error('Failed to fetch workspaces:', error);
                if (user?.companies) {
                    setCompanies(user.companies.map(c => ({
                        ...c,
                        totalEmployees: '?',
                        totalDepartments: '?'
                    })));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchWorkspaces();
    }, [user]);

    const handleSwitch = async (companyId) => {
        try {
            await switchCompany(companyId);
        } catch (error) {
            alert('Failed to switch workspace');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Header onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
            <Sidebar 
                isCollapsed={sidebarCollapsed} 
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />

            <main className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"} pt-16 pb-8`}>
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">My Workspaces</h1>
                            <p className="text-slate-500 mt-1">Manage and switch between your registered companies.</p>
                        </div>
                        <button 
                            onClick={() => navigate('/company-registration')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-all"
                        >
                            <Icon name="Plus" size={18} />
                            Add New Company
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {companies.length > 0 ? (
                                companies.map((company) => (
                                    <div 
                                        key={company.id} 
                                        className={`group bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
                                            company.id === user?.company?.id 
                                            ? 'border-blue-200 ring-2 ring-blue-500/5 shadow-md' 
                                            : 'border-slate-200 hover:border-blue-300 hover:shadow-lg shadow-sm'
                                        }`}
                                    >
                                        {/* Card Header */}
                                        <div className="p-6 pb-4 flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold ${
                                                    company.id === user?.company?.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                    {company.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{company.name}</h3>
                                                    <p className="text-xs text-slate-500">{company.industry || 'General Business'}</p>
                                                </div>
                                            </div>
                                            {company.id === user?.company?.id && (
                                                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-blue-100">
                                                    Active
                                                </span>
                                            )}
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="px-6 py-4 grid grid-cols-2 gap-4 border-t border-slate-50 bg-slate-50/50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                                    <Icon name="Users" size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Employees</p>
                                                    <p className="text-sm font-bold text-slate-700">{company.totalEmployees || 0}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                                    <Icon name="Layers" size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Depts</p>
                                                    <p className="text-sm font-bold text-slate-700">{company.totalDepartments || 0}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Footer */}
                                        <div className="p-4 bg-white border-t border-slate-100">
                                            {company.id === user?.company?.id ? (
                                                <button 
                                                    onClick={() => navigate('/dashboard')}
                                                    className="w-full py-2 bg-slate-50 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed text-center"
                                                    disabled
                                                >
                                                    Already Active
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleSwitch(company.id)}
                                                    className="w-full py-2 bg-white text-blue-600 border border-blue-200 text-xs font-bold rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm text-center"
                                                >
                                                    Switch to Workspace
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                        <Icon name="Layers" size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">No Workspaces Found</h3>
                                    <p className="text-slate-500 max-w-xs mt-1">
                                        We couldn't find any companies associated with your account.
                                    </p>
                                    <button 
                                        onClick={() => navigate('/company-registration')}
                                        className="mt-6 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
                                    >
                                        Register Your First Company
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyCompaniesPage;

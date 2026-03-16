import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Clock, Briefcase, User, LogOut, ChevronRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';

const FeaturesPage = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const modules = [
        {
            title: "Smart Payroll",
            icon: <CreditCard size={32} />,
            detail: "Stop manually calculating salaries. Our engine syncs directly with your attendance and leave tables to generate precise monthly disbursements in seconds.",
            color: "bg-emerald-500",
            shadow: "shadow-emerald-200",
            bullets: ["Automated Tax Deductions", "AES-256 Financial Security", "Instant Salary Slips"],
            // Relevant high-quality image for Payroll/Fintech
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1000"
        },
        {
            title: "Precise Time Tracking",
            icon: <Clock size={32} />,
            detail: "Capture every billable second. With deep integration into the time_entry schema, managers get real-time visibility into productivity without micro-managing.",
            color: "bg-blue-600",
            shadow: "shadow-blue-200",
            bullets: ["Real-time Activity Logs", "Multi-device Syncing", "Project-specific Billing"],
            // Relevant high-quality image for Time Tracking/Data
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000"
        },
        {
            title: "Lifecycle Management",
            icon: <Briefcase size={32} />,
            detail: "From 'add-project' to the final delivery. Manage tasks, clients, and internal teams through a unified pipeline designed for high-velocity agencies.",
            color: "bg-purple-600",
            shadow: "shadow-purple-200",
            bullets: ["RBAC Access Control", "Dynamic Kanban Views", "Client Reporting Portal"],
            // Relevant high-quality image for Project Management
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000"
        }
    ];

    return (
        <div className="bg-white min-h-screen font-sans">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-8">
                            <Link to="/" className="text-2xl font-extrabold tracking-tighter text-blue-600">
                                DIFMO<span className="text-gray-900">CRM</span>
                            </Link>
                            <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
                                <button onClick={() => navigate('/features')} className="text-blue-600 font-bold border-b-2 border-blue-600 transition">Features</button>
                                <Link to="/pricing" className="hover:text-blue-600 transition">Pricing</Link>
                                <Link to="/privacypolicy" className="hover:text-blue-600 transition">Privacy</Link>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <Link to="/dashboard" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span className="hidden sm:inline font-medium text-sm">{user?.firstName || 'User'}</span>
                                    </Link>
                                    <button onClick={handleLogout} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition">
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <Link to="/company-registration" className="bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 shadow-lg shadow-blue-200 transition text-sm font-semibold">
                                    Get Started
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-24">
                <div className="space-y-40">
                    {modules.map((m, i) => (
                        <div key={i} className={`flex flex-col md:flex-row gap-16 items-center ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                            <div className="flex-1 space-y-8">
                                <div className={`${m.color} ${m.shadow} w-20 h-20 rounded-3xl flex items-center justify-center text-white`}>
                                    {m.icon}
                                </div>
                                <h2 className="text-4xl font-bold text-gray-900">{m.title}</h2>
                                <p className="text-gray-600 text-lg leading-relaxed italic border-l-4 border-gray-200 pl-6">
                                    "{m.detail}"
                                </p>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {m.bullets.map((item) => (
                                        <li key={item} className="flex items-center gap-3 font-semibold text-gray-800">
                                            <CheckCircle2 className="text-blue-600" size={20} /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Enhanced Visual with Images */}
                            <div className="flex-1 w-full group relative">
                                <div className={`absolute inset-0 ${m.color} opacity-20 blur-3xl rounded-full`} />
                                <div className="relative bg-white border border-gray-200 rounded-[2.5rem] h-[450px] w-full shadow-2xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                                    {/* Mock Browser Header */}
                                    <div className="flex gap-2 p-4 bg-gray-50 border-b border-gray-100">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                        <div className="ml-4 h-3 w-32 bg-gray-200 rounded-full" />
                                    </div>
                                    {/* Actual Feature Image */}
                                    <div className="relative h-full w-full">
                                        <img
                                            src={m.image}
                                            alt={m.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Overlay to give it a "Dashboard" feel */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
                                            <div className="text-white">
                                                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Live Module Preview</p>
                                                <h4 className="text-xl font-bold">{m.title} Dashboard</h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* How It Works Section */}
            <div className="bg-gray-50 py-10 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Getting Started is Simple</h2>
                        <p className="text-gray-500 mt-4 font-medium">Your entire workspace set up in less than 5 minutes.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop Only) */}
                        <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-blue-200 -z-0" />

                        {/* Step 1 */}
                        <div className="relative z-10 text-center space-y-6 group">
                            <div className="w-24 h-24 bg-white border-4 border-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                                <span className="text-3xl font-black text-blue-600">01</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Register Company</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-6">
                                Create your organization profile and set up your unique domain on our secure NeonDB cloud.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 text-center space-y-6 group">
                            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                                <span className="text-3xl font-black text-white">02</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Onboard Team</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-6">
                                Bulk upload employees or invite them via email. Define roles (Admin, Manager, Employee) in one click.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 text-center space-y-6 group">
                            <div className="w-24 h-24 bg-white border-4 border-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                                <span className="text-3xl font-black text-blue-600">03</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Automate & Scale</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-6">
                                Start tracking attendance and generating payroll. Watch your business data turn into actionable insights.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="bg-gray-900 py-24 text-center px-4">
                <div className="max-w-4xl mx-auto">
                    <ShieldCheck size={48} className="text-blue-500 mx-auto mb-6" />
                    <h2 className="text-4xl font-black text-white mb-6">Built for Modern Teams</h2>
                    <p className="text-gray-400 text-lg mb-10">Experience the power of a unified workflow today.</p>
                    <button onClick={() => navigate('/company-registration')} className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-900/40">
                        Start Your Free Trial
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeaturesPage;
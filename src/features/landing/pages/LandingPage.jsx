import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight, CheckCircle, BarChart2, Users, Shield,
    LogOut, User, Zap, Globe, MessageSquare, ChevronRight
} from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';

const LandingPage = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getFullName = () => user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'User';

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Sticky Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-8">
                            <span className="text-2xl font-extrabold tracking-tighter text-blue-600">DIFMO<span className="text-gray-900">CRM</span></span>
                            <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
                                <Link to="/features" className="hover:text-blue-600 transition">Features</Link>
                                <Link to="/pricing" className="hover:text-blue-600 transition">Pricing</Link>
                                <button onClick={() => navigate('/privacypolicy')} className="hover:text-blue-600 transition">Privacy</button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <Link to="/dashboard" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span className="hidden sm:inline font-medium text-sm">{getFullName()}</span>
                                    </Link>
                                    <button onClick={handleLogout} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition">
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm">Log in</Link>
                                    <Link to="/company-registration" className="bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 shadow-lg  transition text-sm font-semibold">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-16 pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                        <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                            {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
                                <Zap className="w-3 h-3" /> New: AI Insights v2.0
                            </div> */}
                            <h1 className="text-5xl tracking-tight font-black text-gray-900 sm:text-6xl">
                                Scale your business <br />
                                <span className="text-blue-600 italic">faster than ever.</span>
                            </h1>
                            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                                Experience the first CRM built for modern teams. Unified projects, automated payroll, and deep analytics—all in one place. No more switching tabs.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                                <Link to="/company-registration" className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100 group">
                                    Start 14-day Trial <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                                </Link>
                                <Link to="/login" className="flex items-center justify-center px-8 py-4 bg-gray-50 text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition border border-gray-200">
                                    Watch Demo
                                </Link>
                            </div>
                        </div>
                        <div className="mt-16 lg:mt-0 lg:col-span-6 relative">
                            <div className="relative mx-auto w-full rounded-2xl shadow-2xl overflow-hidden border-8 border-gray-900/5">
                                <img className="w-full object-cover" src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80" alt="Dashboard" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Trust Bar */}
            <section className="py-12 border-y border-gray-100 bg-gray-50/30">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">Trusted by over 2,000+ teams in India</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition duration-500">
                        {/* Placeholder logos */}
                        <span className="text-2xl font-bold text-gray-800">BharatTech</span>
                        <span className="text-2xl font-bold text-gray-800">IndoSoft</span>
                        <span className="text-2xl font-bold text-gray-800">QuickCorp</span>
                        <span className="text-2xl font-bold text-gray-800">SkyLink</span>
                    </div>
                </div>
            </section>
            {/* How It Works Section */}
            <div className="bg-gray-50 py-20 border-y border-gray-100">
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
                            <div className="w-24 h-24 bg-white border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                                <span className="text-3xl font-black text-black">01</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Register Company</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-6">
                                Create your organization profile and set up your unique domain on our secure NeonDB cloud.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 text-center space-y-6 group">
                            <div className="w-24 h-24 border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                                <span className="text-3xl font-black  text-black">02</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Onboard Team</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-6">
                                Bulk upload employees or invite them via email. Define roles (Admin, Manager, Employee) in one click.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 text-center space-y-6 group">
                            <div className="w-24 h-24 bg-white border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                                <span className="text-3xl font-black text-black">03</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Automate & Scale</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-6">
                                Start tracking attendance and generating payroll. Watch your business data turn into actionable insights.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Features */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-blue-600 font-bold uppercase text-sm">Unified Power</h2>
                        <p className="text-4xl font-black text-gray-900 mt-2">One platform, endless growth.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { title: 'Project Tracking', desc: 'Manage add-projects and tasks with Gantt charts and Kanban boards.', icon: <Zap className="w-6 h-6" /> },
                            { title: 'HRM & Payroll', desc: 'Seamlessly calculate attendance, leaves, and generate payroll logs.', icon: <Users className="w-6 h-6" /> },
                            { title: 'Enterprise Security', desc: 'Advanced RBAC and Audit logs to keep your company data secure.', icon: <Shield className="w-6 h-6" /> }
                        ].map((feat, idx) => (
                            <div key={idx} className="group p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 transition duration-300">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                                    {feat.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                                <p className="text-gray-500 leading-relaxed mb-6">{feat.desc}</p>
                                <button className="text-blue-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Learn more <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Modern Footer */}
            <footer className="bg-gray-900 text-gray-300 py-20">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
                    <div className="col-span-2">
                        <span className="text-2xl font-black text-white italic">DIFMO.</span>
                        <p className="mt-4 text-gray-500 max-w-xs leading-relaxed">
                            Revolutionizing business management for the next generation of Indian entrepreneurs.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Product</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/features" className="hover:text-blue-400 transition">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-blue-400 transition">Pricing</Link></li>
                            <li><Link to="/demo" className="hover:text-blue-400 transition">Live Demo</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm">
                            <li><button onClick={() => navigate('/privacy-policy')} className="hover:text-blue-400 transition">Privacy Policy</button></li>
                            <li><Link to="/terms" className="hover:text-blue-400 transition">Terms of Use</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Support</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/contact" className="hover:text-blue-400 transition">Help Center</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-400 transition">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-gray-800 text-sm text-center">
                    © 2026 DIFMO Private Limited. Built with passion in Lucknow.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
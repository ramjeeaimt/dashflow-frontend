import React from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, ShieldCheck, Lock, Eye, CheckCircle, MapPin, Trash2, Mail } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';

const PrivacyPolicy = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const lastUpdated = "March 16, 2026";

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getFullName = () => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user?.email || 'User';
    };

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Consistent Professional Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
                            >
                                <IoIosArrowBack size={24} />
                            </button>
                            <span className="text-2xl font-extrabold tracking-tighter text-blue-600">
                                DIFMO<span className="text-gray-900">CRM</span>
                            </span>
                            <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-600 ml-4">
                                <Link to="/features" className="hover:text-blue-600 transition">Features</Link>
                                <Link to="/pricing" className="hover:text-blue-600 transition">Pricing</Link>
                                <button onClick={() => navigate('/privacypolicy')} className="text-blue-600 font-bold border-b-2 border-blue-600 transition">Privacy</button>
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
                                    <Link to="/company-registration" className="bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 shadow-lg transition text-sm font-semibold">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 py-0">
                <div className="bg-white overflow-hidden">
                    {/* Header Banner */}
                    <div className="p-12 text-white bg-slate-700  text-center relative overflow-hidden shadow-xl">
                        {/* <div className="absolute -top-10 -right-10 opacity-10">
                            <ShieldCheck size={20} />
                        </div> */}
                        <h1 className="text-4xl font-black uppercase tracking-tight">Privacy Policy</h1>
                        {/* <p className="mt-2 text-blue-100 opacity-90">Last Updated: {lastUpdated}</p> */}
                    </div>

                    <div className="py-12 md:px-8 text-gray-700 leading-relaxed">
                        {/* 1. Introduction */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <Eye className="text-blue-600" size={24} />
                                <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
                            </div>
                            <p className="text-lg text-gray-600">
                                Welcome to <strong>DIfmo CRM</strong>. We are committed to protecting your personal and business data. 
                                This policy explains how we collect, use, and safeguard your information.
                            </p>
                        </section>

                        {/* 2. Location & Attendance Data - NEW SECTION */}
                        <section className="mb-12 p-8 rounded-3xl border border-blue-100 bg-blue-50/30">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="text-blue-600" size={24} />
                                <h2 className="text-2xl font-bold text-gray-900">2. Attendance & Location Data</h2>
                            </div>
                            <p className="mb-4">The application collects employee attendance information to verify presence at the workplace. This includes:</p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                <li className="flex items-center gap-2 text-sm font-medium text-gray-700"><CheckCircle size={16} className="text-blue-500" /> Employee Name & ID</li>
                                <li className="flex items-center gap-2 text-sm font-medium text-gray-700"><CheckCircle size={16} className="text-blue-500" /> Check-in / Check-out time</li>
                                <li className="flex items-center gap-2 text-sm font-medium text-gray-700"><CheckCircle size={16} className="text-blue-500" /> Location (Attendance Only)</li>
                            </ul>
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl border border-blue-100">
                                    <h4 className="font-bold text-gray-900 text-sm mb-1">Purpose</h4>
                                    <p className="text-sm text-gray-600">To verify employee attendance and ensure check-ins occur from the authorized office location.</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-blue-100">
                                    <h4 className="font-bold text-gray-900 text-sm mb-1">Security & Sharing</h4>
                                    <p className="text-sm text-gray-600">Location data is used <strong>only</strong> for verification and is stored securely. We do <strong>not</strong> share this data with third parties.</p>
                                </div>
                            </div>
                        </section>

                        {/* 3. Information Collection */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">3. General Information We Collect</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { label: 'System User Data', code: 'user_accounts, auth_logs' },
                                    { label: 'Operational Data', code: 'project, task' },
                                    { label: 'Financial Records', code: 'payroll, expense' },
                                    { label: 'Activity Logs', code: 'audit_log' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100">
                                        <div className="mt-1 text-blue-600"><CheckCircle size={18} /></div>
                                        <div>
                                            <p className="font-bold text-gray-900">{item.label}</p>
                                            <code className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-md mt-1 block w-fit font-mono">
                                                {item.code}
                                            </code>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 4. Account Deletion - NEW SECTION */}
                        <section className="mb-12 p-8 rounded-3xl border border-red-100 bg-red-50/20">
                            <div className="flex items-center gap-3 mb-4">
                                <Trash2 className="text-red-600" size={24} />
                                <h2 className="text-2xl font-bold text-gray-900">4. Account Deletion</h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Users have the right to request deletion of their account and associated data. 
                                To request account deletion, please contact us at:
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-red-100 shadow-sm">
                                    <Mail className="text-red-500" size={20} />
                                    <span className="font-bold text-gray-900">info@difmo.com</span>
                                </div>
                                <p className="text-xs text-gray-500 max-w-xs">
                                    Once received, your data will be permanently deleted within a reasonable timeframe, 
                                    excluding data required for legal purposes.
                                </p>
                            </div>
                        </section>

                        {/* 5. Contact Info */}
                        <section className="bg-gray-900 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl">
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-bold mb-2">Questions?</h2>
                                <p className="text-gray-400">Reach out to our support team for privacy-related concerns.</p>
                            </div>
                            <div className="flex-1 space-y-4 w-full">
                                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
                                    <Mail className="text-blue-400" size={20} />
                                    <div>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Support Email</p>
                                        <p className="font-medium">info@difmo.com</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="py-8 text-center text-sm text-gray-400">
                        © {new Date().getFullYear()} DIFMO Private Limited. Manage with confidence.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
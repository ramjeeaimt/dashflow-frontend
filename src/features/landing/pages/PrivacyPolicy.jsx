import React, { useState } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { Link, useNavigate } from 'react-router-dom';
import {
    User, LogOut, ShieldCheck, Lock, Eye, CheckCircle, MapPin,
    Trash2, Mail, Phone, Clock, Fingerprint, FileText, Download,
    AlertCircle, Globe, Server, Database, Shield, Users,
    Building2, Calendar, CreditCard, Bell, Settings,
    HelpCircle, ExternalLink, Copy, Check, X
} from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';

const PrivacyPolicy = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    const lastUpdated = "March 17, 2026";
    const effectiveDate = "April 1, 2026";
    const supportEmail = "admin@difmo.com";
    const dpoEmail = "difwa@difmo.com";
    const grievanceEmail = "codingofworld@difmo.com";

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getFullName = () => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user?.email?.split('@')[0] || 'User';
    };

    // const copyToClipboard = (text: string) => {
    //     navigator.clipboard.writeText(text);
    //     setCopied(true);
    //     setTimeout(() => setCopied(false), 2000);
    // };

    // Data collection categories based on user role
    const dataCategories = [
        {
            role: 'All Users',
            data: [
                { name: 'Account Information', fields: 'Name, Email, Phone, Password (hashed)', purpose: 'Authentication & Communication' },
                { name: 'Profile Data', fields: 'Profile Picture, Department, Designation', purpose: 'Team Management' },
                { name: 'Activity Logs', fields: 'Login timestamps, IP addresses, Browser info', purpose: 'Security & Audit' }
            ]
        },
        {
            role: 'Employees',
            data: [
                { name: 'Attendance Records', fields: 'Check-in/out times, Location (office premises)', purpose: 'Payroll & Compliance' },
                { name: 'Leave Management', fields: 'Leave types, Dates, Approvals', purpose: 'HR Operations' },
                { name: 'Task & Project Data', fields: 'Assigned tasks, Project contributions', purpose: 'Performance Tracking' }
            ]
        },
        {
            role: 'Managers',
            data: [
                { name: 'Team Performance', fields: 'Team metrics, Productivity reports', purpose: 'Management' },
                { name: 'Approval Records', fields: 'Leave approvals, Expense approvals', purpose: 'Operational' }
            ]
        },
        {
            role: 'Admins',
            data: [
                { name: 'Company Settings', fields: 'Organization structure, Role configurations', purpose: 'Administration' },
                { name: 'Audit Logs', fields: 'All system activities', purpose: 'Compliance' }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Consistent Professional Navigation */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                                aria-label="Go back"
                            >
                                <IoIosArrowBack size={20} />
                            </button>
                            <Link to="/" className="flex items-center gap-2">
                                <span className="text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    DIFMO
                                </span>
                                {/* <span className="text-2xl font-light text-gray-400">/</span> */}
                                <span className="text-2xl font-extrabold text-gray-700">CRM</span>
                            </Link>
                            <div className="hidden md:flex items-center space-x-1 ml-4">
                                <Link to="/features" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Features</Link>
                                <Link to="/pricing" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Pricing</Link>
                                {/* <Link to="/security" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Security</Link> */}
                                <button 
                                    onClick={() => navigate('/privacy-policy')} 
                                    className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg border-b-2 border-blue-600"
                                >
                                    Privacy
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <Link 
                                        to="/dashboard" 
                                        className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                    >
                                        <User className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">{getFullName()}</span>
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
                                        className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition"
                                        title="Logout"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link 
                                        to="/login" 
                                        className="text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-2 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        Log in
                                    </Link>
                                    <Link 
                                        to="/company-registration" 
                                        className="bg-blue-600 text-white rounded-xl px-5 py-2 rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all text-sm font-semibold"
                                    >
                                        Start Free Trial
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section with Trust Badges */}
            <div className="bg-green-500 text-white">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="w-10 h-10 text-blue-200" />
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight">Privacy Policy</h1>
                            </div>
                            <p className="text-xl text-blue-100 max-w-2xl">
                                Your data security and privacy are our top priorities. We're committed to transparency and compliance with global privacy standards.
                            </p>
                            <div className="flex flex-wrap gap-4 mt-6">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">Last Updated: {lastUpdated}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">Effective: {effectiveDate}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
                                    <Fingerprint className="w-4 h-4" />
                                    <span className="text-sm">ISO 27001 Certified</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Trust Badges */}
                        <div className="mt-8 md:mt-0 grid grid-cols-2 gap-4">
                            {[
                                { label: 'GDPR Compliant', icon: <Globe className="w-5 h-5" /> },
                                { label: 'ISO 27001', icon: <Shield className="w-5 h-5" /> },
                                { label: 'SOC2 Type II', icon: <CheckCircle className="w-5 h-5" /> },
                                { label: 'Data Sovereignty', icon: <Server className="w-5 h-5" /> }
                            ].map((badge, idx) => (
                                <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                                    <div className="flex justify-center mb-1">{badge.icon}</div>
                                    <span className="text-xs font-medium">{badge.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Navigation Tabs */}
            <div className="border-b border-gray-200 bg-white sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex overflow-x-auto hide-scrollbar gap-2 py-4">
                        {[
                            { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
                            { id: 'attendance', label: 'Attendance Data', icon: <MapPin className="w-4 h-4" /> },
                            { id: 'collection', label: 'Data Collection', icon: <Database className="w-4 h-4" /> },
                            { id: 'rights', label: 'Your Rights', icon: <Lock className="w-4 h-4" /> },
                            { id: 'deletion', label: 'Account Deletion', icon: <Trash2 className="w-4 h-4" /> },
                            { id: 'contact', label: 'Contact', icon: <Mail className="w-4 h-4" /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    document.getElementById(tab.id)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                                    activeTab === tab.id
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Table of Contents */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Contents</h3>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <a href="#introduction" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        1. Introduction
                                    </a>
                                </li>
                                <li>
                                    <a href="#attendance" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        2. Attendance & Location
                                    </a>
                                </li>
                                <li>
                                    <a href="#collection" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        3. Data Collection
                                    </a>
                                </li>
                                <li>
                                    <a href="#usage" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        4. How We Use Data
                                    </a>
                                </li>
                                <li>
                                    <a href="#security" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        5. Security Measures
                                    </a>
                                </li>
                                <li>
                                    <a href="#rights" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        6. Your Rights
                                    </a>
                                </li>
                                <li>
                                    <a href="#sharing" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        7. Data Sharing
                                    </a>
                                </li>
                                <li>
                                    <a href="#retention" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        8. Data Retention
                                    </a>
                                </li>
                                <li>
                                    <a href="#deletion" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        9. Account Deletion
                                    </a>
                                </li>
                                <li>
                                    <a href="#contact" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        10. Contact Us
                                    </a>
                                </li>
                            </ul>

                            {/* Download Options */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition">
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-12">
                        {/* 1. Introduction */}
                        <section id="introduction" className="scroll-mt-24">
                            <div className="bg-white rounded-2xl border border-gray-200 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Eye className="text-blue-600" size={20} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Welcome to <strong className="text-gray-900">DIFMO CRM</strong>. We are committed to protecting your personal and business data with the highest standards of security and transparency. This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                                </p>
                                <p className="text-gray-600 mb-6">
                                    By using DIFMO CRM, you consent to the data practices described in this policy. We encourage you to read this document carefully and contact us with any questions.
                                </p>
                                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-blue-600" />
                                        Key Principles
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { title: 'Transparency', desc: 'Clear communication about data usage' },
                                            { title: 'Security First', desc: 'Enterprise-grade encryption & controls' },
                                            { title: 'User Control', desc: 'Full access to your data' }
                                        ].map((principle, idx) => (
                                            <div key={idx} className="bg-white rounded-lg p-3">
                                                <h4 className="font-semibold text-sm mb-1">{principle.title}</h4>
                                                <p className="text-xs text-gray-500">{principle.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Attendance & Location Data */}
                        <section id="attendance" className="scroll-mt-24">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                        <MapPin className="text-white" size={20} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">2. Attendance & Location Data</h2>
                                </div>
                                
                                <p className="text-gray-700 mb-6">
                                    DIFMO CRM collects attendance information to verify employee presence at workplace locations. This is a core feature for accurate payroll and compliance management.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-white rounded-xl p-6 shadow-sm">
                                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Data Collected
                                        </h3>
                                        <ul className="space-y-3">
                                            {[
                                                'Employee Name & ID',
                                                'Check-in / Check-out timestamps',
                                                'Office location coordinates (during check-in only)',
                                                'Device information & IP address'
                                            ].map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <span className="text-blue-600 mt-0.5">•</span>
                                                    <span className="text-gray-600">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-xl p-6 shadow-sm">
                                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-blue-500" />
                                            Security Measures
                                        </h3>
                                        <ul className="space-y-3">
                                            {[
                                                'End-to-end encryption in transit',
                                                'Location data anonymized after 30 days',
                                                'Access restricted to HR & managers only',
                                                'Full audit trail of all access'
                                            ].map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <span className="text-blue-600 mt-0.5">•</span>
                                                    <span className="text-gray-600">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-blue-600 text-white rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm">
                                        <strong>Important:</strong> Location data is only collected during check-in/out and is used solely for attendance verification. We never track employee location outside of these transactions.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 3. Data Collection by Role */}
                        <section id="collection" className="scroll-mt-24">
                            <div className="bg-white rounded-2xl border border-gray-200 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Database className="text-purple-600" size={20} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">3. Data Collection by Role</h2>
                                </div>
                                
                                <p className="text-gray-600 mb-6">
                                    We collect different types of data based on your role within the organization. This role-based approach ensures we only collect information necessary for your specific functions.
                                </p>

                                <div className="space-y-6">
                                    {dataCategories.map((category, idx) => (
                                        <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                                <h3 className="font-bold text-gray-900">{category.role}</h3>
                                            </div>
                                            <div className="divide-y divide-gray-100">
                                                {category.data.map((item, itemIdx) => (
                                                    <div key={itemIdx} className="p-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <span className="text-xs font-semibold text-gray-400 uppercase">Data Category</span>
                                                                <p className="font-medium text-gray-900 mt-1">{item.name}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-semibold text-gray-400 uppercase">Fields</span>
                                                                <p className="text-sm text-gray-600 mt-1">{item.fields}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-semibold text-gray-400 uppercase">Purpose</span>
                                                                <p className="text-sm text-gray-600 mt-1">{item.purpose}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 4. How We Use Data */}
                        <section id="usage" className="scroll-mt-24">
                            <div className="bg-white rounded-2xl border border-gray-200 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">4. How We Use Your Data</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {[
                                        {
                                            title: 'Service Delivery',
                                            desc: 'To provide and maintain our CRM services',
                                            examples: ['User authentication', 'Project management', 'Payroll processing']
                                        },
                                        {
                                            title: 'Improvement',
                                            desc: 'To enhance and optimize platform features',
                                            examples: ['Analytics', 'Performance monitoring', 'Feature development']
                                        },
                                        {
                                            title: 'Compliance',
                                            desc: 'To meet legal and regulatory requirements',
                                            examples: ['Audit trails', 'Tax compliance', 'Data retention']
                                        },
                                        {
                                            title: 'Security',
                                            desc: 'To protect against unauthorized access',
                                            examples: ['Threat detection', 'Access logs', 'Encryption']
                                        }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-xl p-5">
                                            <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                                            <p className="text-sm text-gray-600 mb-3">{item.desc}</p>
                                            <ul className="space-y-1">
                                                {item.examples.map((example, exIdx) => (
                                                    <li key={exIdx} className="text-xs text-gray-500 flex items-center gap-1">
                                                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                                        {example}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                    <p className="text-sm text-amber-800 flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>
                                            <strong>We do not sell your personal data.</strong> Your information is used exclusively for providing and improving our services.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 5. Security Measures */}
                        <section id="security" className="scroll-mt-24">
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                        <Shield className="text-white" size={20} />
                                    </div>
                                    <h2 className="text-2xl font-bold">5. Enterprise Security Measures</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {[
                                        {
                                            title: 'Encryption',
                                            value: 'AES-256 at rest, TLS 1.3 in transit',
                                            icon: <Lock className="w-5 h-5" />
                                        },
                                        {
                                            title: 'Authentication',
                                            value: '2FA, SSO, Biometric support',
                                            icon: <Fingerprint className="w-5 h-5" />
                                        },
                                        {
                                            title: 'Access Control',
                                            value: 'RBAC with granular permissions',
                                            icon: <Users className="w-5 h-5" />
                                        },
                                        {
                                            title: 'Audit Logs',
                                            value: 'Complete trail of all activities',
                                            icon: <FileText className="w-5 h-5" />
                                        }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="text-green-400">{item.icon}</div>
                                                <h3 className="font-semibold">{item.title}</h3>
                                            </div>
                                            <p className="text-sm text-gray-300">{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-center">
                                    {[
                                        { label: 'Uptime SLA', value: '99.9%' },
                                        { label: 'Response Time', value: '< 100ms' },
                                        { label: 'Certifications', value: 'ISO, SOC2' }
                                    ].map((stat, idx) => (
                                        <div key={idx} className="bg-white/5 rounded-lg p-3">
                                            <div className="text-xl font-bold">{stat.value}</div>
                                            <div className="text-xs text-gray-400">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 6. Your Rights */}
                        <section id="rights" className="scroll-mt-24">
                            <div className="bg-white rounded-2xl border border-gray-200 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Your Privacy Rights</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {[
                                        {
                                            right: 'Right to Access',
                                            desc: 'Request a copy of your personal data',
                                            icon: <Eye className="w-5 h-5" />
                                        },
                                        {
                                            right: 'Right to Rectification',
                                            desc: 'Correct inaccurate or incomplete data',
                                            icon: <CheckCircle className="w-5 h-5" />
                                        },
                                        {
                                            right: 'Right to Erasure',
                                            desc: 'Request deletion of your data',
                                            icon: <Trash2 className="w-5 h-5" />
                                        },
                                        {
                                            right: 'Right to Portability',
                                            desc: 'Receive your data in a portable format',
                                            icon: <Download className="w-5 h-5" />
                                        }
                                    ].map((item, idx) => (
                                        <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="text-blue-600">{item.icon}</div>
                                                <h3 className="font-bold text-gray-900">{item.right}</h3>
                                            </div>
                                            <p className="text-sm text-gray-600">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="font-bold text-gray-900 mb-3">How to Exercise Your Rights</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        To exercise any of these rights, please contact our Data Protection Officer at:
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="font-mono text-sm">{dpoEmail}</span>
                                            <button 
                                                onClick={() => copyToClipboard(dpoEmail)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 7. Data Sharing */}
                        <section id="sharing" className="scroll-mt-24">
                            <div className="bg-white rounded-2xl border border-gray-200 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Data Sharing & Third Parties</h2>

                                <p className="text-gray-600 mb-6">
                                    We share data only with trusted service providers who assist in operating our platform, and only under strict data processing agreements.
                                </p>

                                <div className="space-y-4">
                                    {[
                                        {
                                            provider: 'Cloud Infrastructure',
                                            purpose: 'Data hosting and storage',
                                            location: 'India (Mumbai, Chennai)',
                                            certification: 'ISO 27001'
                                        },
                                        {
                                            provider: 'Payment Processing',
                                            purpose: 'Subscription billing',
                                            location: 'PCI DSS Level 1',
                                            certification: 'Razorpay'
                                        },
                                        {
                                            provider: 'Email Services',
                                            purpose: 'Notifications and alerts',
                                            location: 'TLS encrypted',
                                            certification: 'AWS SES'
                                        }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{item.provider}</h3>
                                                <p className="text-sm text-gray-600">{item.purpose}</p>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 md:mt-0">
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                    {item.location}
                                                </span>
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                    {item.certification}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-xs text-gray-400 mt-4">
                                    We never sell your data to third parties for marketing purposes.
                                </p>
                            </div>
                        </section>

                        {/* 8. Data Retention */}
                        <section id="retention" className="scroll-mt-24">
                            <div className="bg-white rounded-2xl border border-gray-200 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Data Retention Periods</h2>

                                <div className="space-y-4">
                                    {[
                                        { type: 'Account Information', period: 'Until account deletion', purpose: 'Service delivery' },
                                        { type: 'Attendance Records', period: '3 years', purpose: 'Legal compliance' },
                                        { type: 'Payroll Data', period: '7 years', purpose: 'Tax regulations' },
                                        { type: 'Audit Logs', period: '1 year', purpose: 'Security analysis' },
                                        { type: 'Session Data', period: '30 days', purpose: 'Analytics' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{item.type}</h3>
                                                <p className="text-xs text-gray-500">{item.purpose}</p>
                                            </div>
                                            <span className="text-sm font-medium text-blue-600">{item.period}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 9. Account Deletion */}
                        <section id="deletion" className="scroll-mt-24">
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-200 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                                        <Trash2 className="text-white" size={20} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">9. Account Deletion</h2>
                                </div>

                                <p className="text-gray-700 mb-6">
                                    You have the right to request permanent deletion of your account and associated data. We'll process your request within 30 days.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-white rounded-xl p-6">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-red-500" />
                                            Request via Email
                                        </h3>
                                        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg mb-3">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="font-mono text-sm flex-1">{grievanceEmail}</span>
                                            <button 
                                                onClick={() => copyToClipboard(grievanceEmail)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                <Copy className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Include your registered email and reason for deletion
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-xl p-6">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Settings className="w-4 h-4 text-red-500" />
                                            In-App Deletion
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Admins can request deletion from:
                                        </p>
                                        <code className="text-xs bg-gray-100 p-2 rounded block">
                                            Settings → Organization → Delete Account
                                        </code>
                                    </div>
                                </div>

                                {showDeleteConfirm ? (
                                    <div className="bg-white rounded-xl p-6 border-2 border-red-300">
                                        <h4 className="font-bold text-red-600 mb-4">Confirm Account Deletion</h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Are you sure? This action cannot be undone. All your data will be permanently deleted.
                                        </p>
                                        <div className="flex gap-3">
                                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
                                                Yes, Delete Permanently
                                            </button>
                                            <button 
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Request Account Deletion
                                    </button>
                                )}

                                <p className="text-xs text-gray-500 mt-4">
                                    Note: Some data may be retained for legal compliance (tax records, audit logs) as required by law.
                                </p>
                            </div>
                        </section>

                        {/* 10. Contact Us */}
                        <section id="contact" className="scroll-mt-24">
                            <div className="bg-green-500 rounded-2xl p-8 text-white">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                                        <Mail className="text-white" size={20} />
                                    </div>
                                    <h2 className="text-2xl font-bold">10. Contact Our Privacy Team</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    {[
                                        {
                                            title: 'General Inquiries',
                                            email: supportEmail,
                                            response: '24-48 hours',
                                            icon: <Mail className="w-5 h-5" />
                                        },
                                        {
                                            title: 'Data Protection Officer',
                                            email: dpoEmail,
                                            response: '48-72 hours',
                                            icon: <Shield className="w-5 h-5" />
                                        },
                                        {
                                            title: 'Grievance Officer',
                                            email: grievanceEmail,
                                            response: '24 hours',
                                            icon: <AlertCircle className="w-5 h-5" />
                                        }
                                    ].map((contact, idx) => (
                                        <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
                                            <div className="flex items-center gap-2 mb-3">
                                                {contact.icon}
                                                <h3 className="font-semibold">{contact.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 mb-2">
                                                <Mail className="w-3 h-3 opacity-70" />
                                                <span className="text-sm font-mono">{contact.email}</span>
                                                <button 
                                                    onClick={() => copyToClipboard(contact.email)}
                                                    className="ml-auto hover:bg-white/20 p-1 rounded"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-blue-200">Response: {contact.response}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/10 rounded-xl p-6 backdrop-blur">
                                    <div className="flex items-center gap-4">
                                        <Phone className="w-5 h-5" />
                                        <div>
                                            <p className="text-sm opacity-90">Emergency Privacy Concern</p>
                                            <p className="text-xs opacity-70">For critical data breaches only</p>
                                        </div>
                                    </div>
                                    <div className="text-xl font-mono"> 342441413132</div>
                                </div>

                                <div className="mt-6 text-center text-sm text-blue-200">
                                    <p>Our offices: Lucknow (HQ) • Mumbai • Bangalore</p>
                                    <p className="mt-2">Registered Address: 42/12, Vibhuti Khand, Gomti Nagar, Lucknow, UP 226010</p>
                                </div>
                            </div>
                        </section>

                        {/* Footer Note */}
                        <div className="text-center text-sm text-gray-400 pt-8">
                            <p>© {new Date().getFullYear()} DIFMO Private Limited. All rights reserved.</p>
                            <p className="mt-2">This privacy policy was last updated on {lastUpdated}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Help Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition group relative">
                    <HelpCircle className="w-6 h-6" />
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                        Privacy questions? Chat with us
                    </span>
                </button>
            </div>

            {/* Cookie Consent */}
            <div className="fixed bottom-6 left-6 bg-white rounded-lg shadow-2xl p-4 max-w-sm border border-gray-200 z-50 hidden md:block">
                <div className="flex items-start gap-3">
                    {/* <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" /> */}
                    <div>
                        {/* <p className="text-sm text-gray-600 mb-3">
                            We use cookies to enhance your privacy and security. By continuing, you agree to our privacy practices.
                        </p> */}
                        {/* <div className="flex gap-2">
                            <button className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition">
                                Accept
                            </button>
                            <button className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-200 transition">
                                Customize
                            </button>
                        </div> */}
                    </div>
                    {/* <button className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button> */}
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
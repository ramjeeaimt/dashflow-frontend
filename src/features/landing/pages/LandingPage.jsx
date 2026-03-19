import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight, CheckCircle, BarChart2, Users, Shield,
    LogOut, User, Zap, Globe, MessageSquare, ChevronRight,
    Clock, Target, TrendingUp, Briefcase, Calendar,
    Download, Mail, Phone, Star, Play, Settings,
    Bell, PieChart, Activity, Award, Rocket, DollarSign,
    Eye, EyeOff, Lock, Fingerprint, Heart, Share2,
    Twitter, Linkedin, Facebook, Youtube, Menu, X
} from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';

const LandingPage = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getFullName = () => {
        if (!user) return 'User';
        return user.firstName ? `${user.firstName} ${user.lastName}` : user.email?.split('@')[0] || 'User';
    };

    const getUserRole = () => {
        if (!user?.role) return null;
        const roles = {
            SUPER_ADMIN: { label: 'Super Admin', color: 'purple' },
            ADMIN: { label: 'Admin', color: 'red' },
            MANAGER: { label: 'Manager', color: 'blue' },
            EMPLOYEE: { label: 'Employee', color: 'green' }
        };
        return roles[user.role] || null;
    };

    const userRole = getUserRole();

    // Demo data for different roles
    const roleBasedContent = {
        SUPER_ADMIN: {
            metrics: [
                { label: 'Total Companies', value: '24', change: '+3', icon: <Briefcase className="w-4 h-4" /> },
                { label: 'Active Users', value: '1,847', change: '+12%', icon: <Users className="w-4 h-4" /> },
                { label: 'Revenue (MTD)', value: '₹84.2L', change: '+8%', icon: <DollarSign className="w-4 h-4" /> },
                { label: 'System Health', value: '98.5%', change: 'Stable', icon: <Activity className="w-4 h-4" /> }
            ],
            quickActions: [
                { label: 'Add New Company', icon: <Briefcase className="w-4 h-4" />, path: '/company-registration' },
                { label: 'View Audit Logs', icon: <Shield className="w-4 h-4" />, path: '/audit-logs' },
                { label: 'System Settings', icon: <Settings className="w-4 h-4" />, path: '/settings' }
            ]
        },
        ADMIN: {
            metrics: [
                { label: 'Total Employees', value: '156', change: '+8', icon: <Users className="w-4 h-4" /> },
                { label: 'Projects Active', value: '23', change: '5 due', icon: <Briefcase className="w-4 h-4" /> },
                { label: 'Pending Approvals', value: '12', change: 'Urgent: 3', icon: <Clock className="w-4 h-4" /> },
                { label: 'This Month Payroll', value: '₹42.5L', change: 'Processing', icon: <DollarSign className="w-4 h-4" /> }
            ],
            quickActions: [
                { label: 'Add Employee', icon: <User className="w-4 h-4" />, path: '/employees/add' },
                { label: 'Create Project', icon: <Target className="w-4 h-4" />, path: '/projects/create' },
                { label: 'Run Payroll', icon: <DollarSign className="w-4 h-4" />, path: '/payroll/run' }
            ]
        },
        MANAGER: {
            metrics: [
                { label: 'Team Members', value: '12', change: '+2', icon: <Users className="w-4 h-4" /> },
                { label: 'Active Projects', value: '8', change: '3 completed', icon: <Briefcase className="w-4 h-4" /> },
                { label: 'Team Leaves', value: '4', change: '2 pending', icon: <Calendar className="w-4 h-4" /> },
                { label: 'Productivity', value: '94%', change: '+5%', icon: <TrendingUp className="w-4 h-4" /> }
            ],
            quickActions: [
                { label: 'Assign Task', icon: <Target className="w-4 h-4" />, path: '/tasks/assign' },
                { label: 'Team Calendar', icon: <Calendar className="w-4 h-4" />, path: '/calendar' },
                { label: 'Approve Leaves', icon: <CheckCircle className="w-4 h-4" />, path: '/leaves/approve' }
            ]
        },
        EMPLOYEE: {
            metrics: [
                { label: 'My Projects', value: '4', change: '2 active', icon: <Briefcase className="w-4 h-4" /> },
                { label: 'Pending Tasks', value: '8', change: '3 due today', icon: <Target className="w-4 h-4" /> },
                { label: 'Leave Balance', value: '12 days', change: 'Available', icon: <Calendar className="w-4 h-4" /> },
                { label: 'Attendance', value: '92%', change: 'This month', icon: <Clock className="w-4 h-4" /> }
            ],
            quickActions: [
                { label: 'Mark Attendance', icon: <Clock className="w-4 h-4" />, path: '/attendance/mark' },
                { label: 'Apply Leave', icon: <Calendar className="w-4 h-4" />, path: '/leaves/apply' },
                { label: 'View Payslip', icon: <DollarSign className="w-4 h-4" />, path: '/payroll/payslips' }
            ]
        }
    };

    const currentRoleContent = user?.role ? roleBasedContent[user.role] : null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Live Notification Banner */}
            {showNotification && (
                <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm relative">
                    <p className="animate-pulse inline-flex items-center gap-2">
                        <Zap className="w-4 h-4" /> 
                        <span className="font-medium">Live Demo Available:</span> See how DIFMO CRM handles 10,000+ concurrent users with 99.9% uptime. 
                        <button className="underline font-bold ml-2 hover:text-blue-200">Join Live Demo →</button>
                    </p>
                    <button 
                        onClick={() => setShowNotification(false)}
                        className="absolute right-4 top-2 text-white/80 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Sticky Navigation with Role Indicator */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <div className="flex items-center gap-8">
                            <Link to="/" className="flex items-center gap-2">
                                <span className="text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    DIFMO
                                </span>
                                {/* <span className="text-2xl font-light text-gray-400">/</span> */}
                                <span className="text-2xl font-extrabold text-gray-700">CRM</span>
                            </Link>
                            
                            {/* Desktop Navigation */}
                            <div className="hidden md:flex space-x-1">
                                <Link to="/features" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Features</Link>
                                <Link to="/pricing" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Pricing</Link>
                                {/* <Link to="/enterprise" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Enterprise</Link> */}
                                {/* <Link to="/customers" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Customers</Link> */}
                                <button onClick={() => navigate('/privacypolicy')} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Privacy</button>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                            {/* Role-based quick access */}
                            {isAuthenticated && userRole && (
                                <div className="hidden md:flex items-center gap-2 mr-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold bg-${userRole.color}-100 text-${userRole.color}-700`}>
                                        {userRole.label}
                                    </span>
                                </div>
                            )}

                            {/* User Menu */}
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
                                        className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition flex items-center gap-2"
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
                                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all text-sm font-semibold flex items-center gap-2"
                                    >
                                        Start Free Trial <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button 
                                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100">
                            <div className="flex flex-col space-y-2">
                                <Link to="/features" className="px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">Features</Link>
                                <Link to="/pricing" className="px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">Pricing</Link>
                                <Link to="/enterprise" className="px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">Enterprise</Link>
                                <Link to="/customers" className="px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">Customers</Link>
                                <button onClick={() => navigate('/contact')} className="px-3 py-2 text-left text-gray-700 hover:bg-blue-50 rounded-lg">Contact</button>
                                {isAuthenticated && (
                                    <Link to="/dashboard" className="px-3 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg">
                                        Go to Dashboard
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Personalized Welcome Section for Authenticated Users */}
            {isAuthenticated && currentRoleContent && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">
                                    Welcome back, {getFullName()}! 
                                    <span className="ml-2 text-sm bg-white/20 px-3 py-1 rounded-full">
                                        {userRole?.label}
                                    </span>
                                </h1>
                                <p className="text-blue-100">
                                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <Link 
                                to="/dashboard" 
                                className="mt-4 md:mt-0 bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2 w-fit"
                            >
                                Go to Dashboard <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Role-based Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            {currentRoleContent.metrics.map((metric, idx) => (
                                <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-blue-100 text-sm">{metric.label}</span>
                                        <span className="text-white/80">{metric.icon}</span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <span className="text-2xl font-bold">{metric.value}</span>
                                        <span className="text-xs text-green-300 bg-green-500/20 px-2 py-1 rounded">
                                            {metric.change}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-3 mt-6">
                            {currentRoleContent.quickActions.map((action, idx) => (
                                <Link
                                    key={idx}
                                    to={action.path}
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-lg px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition border border-white/20"
                                >
                                    {action.icon}
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section - Dynamic based on auth */}
            <header className="relative pt-16 pb-24 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                        <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                            {/* Live Stats Badge */}
                            {/* <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-6 border border-green-200">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Live: 1,847 active users right now
                            </div> */}

                            <h1 className="text-5xl tracking-tight font-black text-gray-900 sm:text-6xl lg:text-7xl">
                                {isAuthenticated ? (
 <>Grow Your Bussiness <br />
                                <span className="text-blue-600">With Us</span></>
                                ) : (
 <>Scale your business <br />
                                <span className="text-blue-600">faster than ever</span></>
                                )}
                            </h1>
                            
                            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
                                {isAuthenticated 
                                    ? "Pick up right where you stopped. Your team, projects, and analytics are waiting for you."
                                    : "The first CRM built for modern Indian teams. Unified projects, automated payroll, and deep analytics—all in one place. No more switching tabs."}
                            </p>

                            {/* Trust Indicators */}
                            <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>ISO 27001 Certified</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-blue-500" />
                                    <span>100% Data Sovereignty</span>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                                {isAuthenticated ? (
                                    <Link 
                                        to="/dashboard" 
                                        className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100 group"
                                    >
                                        Go to Dashboard <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link 
                                            to="/company-registration" 
                                            className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100 group"
                                        >
                                            Start 14-day Trial <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                const demoSection = document.getElementById('demo-video');
                                                demoSection?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="flex items-center justify-center px-8 py-4 bg-gray-50 text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition border border-gray-200 gap-2"
                                        >
                                            <Play className="w-4 h-4" /> Watch Demo
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Social Proof */}
                            <div className="mt-10 flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {[1,2,3,4].map((i) => (
                                        <img
                                            key={i}
                                            className="w-8 h-8 rounded-full border-2 border-white"
                                            src={`https://i.pravatar.cc/32?img=${i}`}
                                            alt={`User ${i}`}
                                        />
                                    ))}
                                </div>
                                <div className="text-sm">
                                    <span className="font-bold text-gray-900">2,000+</span>
                                    <span className="text-gray-500"> teams trust us</span>
                                </div>
                                <div className="h-4 w-px bg-gray-300"></div>
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="ml-1 text-gray-600">4.9</span>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Preview */}
                        <div className="mt-16 lg:mt-0 lg:col-span-6 relative">
                            <div className="relative mx-auto w-full">
                                {/* Main Image */}
                                <div className="relative rounded-2xl shadow-2xl overflow-hidden border-8 border-white">
                                    <img 
                                        className="w-full object-cover" 
                                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80" 
                                        alt="Dashboard Preview"
                                    />
                                    
                                    {/* Floating Stats */}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg px-4 py-2 shadow-lg">
                                        <div className="text-sm font-medium text-gray-600">Active Sessions</div>
                                        <div className="text-lg font-bold text-green-600">1,847 online</div>
                                    </div>
                                    
                                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-lg px-4 py-2 shadow-lg">
                                        <div className="text-sm font-medium text-gray-600">Response Time</div>
                                        <div className="text-lg font-bold text-blue-600">89ms</div>
                                    </div>
                                </div>

                                {/* Badge */}
                                {/* <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-xl">
                                    <span className="font-bold">✨ New: AI Analytics</span>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Demo Video Section */}
            <section id="demo-video" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black text-gray-900">See DIFMO CRM in Action</h2>
                        <p className="text-gray-600 mt-4">Watch how teams are transforming their workflow</p>
                    </div>
                    
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video max-w-4xl mx-auto">
                        <img 
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80" 
                            alt="Video Thumbnail"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-110 transition shadow-2xl">
                                <Play className="w-8 h-8 text-blue-600 ml-1" />
                            </button>
                        </div>
                        
                        {/* Video Stats */}
                        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur text-white px-4 py-2 rounded-lg text-sm">
                            <span className="font-medium">12,847 views</span> • <span>2 days ago</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-center gap-8 mt-8 text-sm text-gray-500">
                        <span>⚡ 5-min setup</span>
                        <span>🔒 Enterprise security</span>
                        <span>📱 Mobile app included</span>
                    </div>
                </div>
            </section>

            {/* Trust Bar with Real Companies */}
            <section className="py-16 border-y border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">Trusted by India's fastest growing companies</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-70 hover:opacity-100 transition">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-gray-800">BharatPe</span>
                            <span className="text-xs text-gray-400">Fintech</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-gray-800">Razorpay</span>
                            <span className="text-xs text-gray-400">Payments</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-gray-800">CRED</span>
                            <span className="text-xs text-gray-400">Loyalty</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-gray-800">Zerodha</span>
                            <span className="text-xs text-gray-400">Broking</span>
                        </div>
                    </div>
                    
                    {/* Rating Badge */}
                    <div className="mt-8 inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                        <Award className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">#1 CRM for SMBs 2024 - G2 Crowd</span>
                    </div>
                </div>
            </section>

            {/* How It Works Section - Interactive */}
            <div className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Get Started in 3 Simple Steps</h2>
                        <p className="text-gray-500 mt-4 text-lg">Join 2,000+ Indian businesses already using DIFMO CRM</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Progress Line */}
                        <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"></div>

                        {/* Step 1 */}
                        <div className="relative text-center group cursor-pointer">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl rotate-45 transform group-hover:rotate-0 transition-all duration-500 shadow-xl group-hover:shadow-2xl mb-8">
                                <div className="w-full h-full flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-all duration-500">
                                    <span className="text-3xl font-black text-white">01</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Register Your Company</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-4">
                                Create your company profile in under 2 minutes. Get your dedicated instance on our secure cloud.
                            </p>
                            <div className="mt-4 text-xs text-blue-600 font-medium">
                                Avg. time: 2 mins ⏱️
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative text-center group cursor-pointer">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl rotate-45 transform group-hover:rotate-0 transition-all duration-500 shadow-xl group-hover:shadow-2xl mb-8">
                                <div className="w-full h-full flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-all duration-500">
                                    <span className="text-3xl font-black text-white">02</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Invite Your Team</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-4">
                                Bulk upload employees or send invites. Assign roles and permissions based on their functions.
                            </p>
                            <div className="mt-4 flex justify-center -space-x-2">
                                <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/24?img=1" alt="Team" />
                                <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/24?img=2" alt="Team" />
                                <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/24?img=3" alt="Team" />
                                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center border-2 border-white">+9</span>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative text-center group cursor-pointer">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl rotate-45 transform group-hover:rotate-0 transition-all duration-500 shadow-xl group-hover:shadow-2xl mb-8">
                                <div className="w-full h-full flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-all duration-500">
                                    <span className="text-3xl font-black text-white">03</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Go Live & Scale</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-4">
                                Start tracking projects, attendance, and payroll. Watch your business grow with real-time insights.
                            </p>
                            <div className="mt-4 flex items-center justify-center gap-1 text-green-600">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs font-medium">Average 40% efficiency gain</span>
                            </div>
                        </div>
                    </div>

                    {/* Live Demo CTA */}
                    <div className="mt-16 text-center">
                        <Link 
                            to="/company-registration" 
                            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition group"
                        >
                            Start your 14-day free trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                        </Link>
                        <p className="mt-3 text-sm text-gray-500">No credit card required • Full access • Cancel anytime</p>
                    </div>
                </div>
            </div>

            {/* Main Features with Icons */}
            <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-blue-600 font-bold text-sm uppercase tracking-wider">Everything you need</span>
                        <h2 className="text-4xl font-black text-gray-900 mt-2">One Platform, Infinite Possibilities</h2>
                        <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                            Built for Indian businesses, with features that actually matter. No bloated modules, just pure productivity.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Project Management */}
                        <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300">
                            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                <Briefcase className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition">Project Management</h3>
                            <p className="text-gray-500 leading-relaxed mb-4">
                                Kanban boards, Gantt charts, and timeline views. Assign tasks, track progress, and hit deadlines.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> 12 templates</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Team collaboration</span>
                            </div>
                        </div>

                        {/* HRM & Payroll */}
                        <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300">
                            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                <Users className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-600 transition">HRM & Payroll</h3>
                            <p className="text-gray-500 leading-relaxed mb-4">
                                Automated attendance, leave management, and payroll processing with TDS, PF, and ESI calculations.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Auto attendance</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Compliance ready</span>
                            </div>
                        </div>

                        {/* Analytics */}
                        <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300">
                            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                                <PieChart className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-purple-600 transition">Deep Analytics</h3>
                            <p className="text-gray-500 leading-relaxed mb-4">
                                Real-time dashboards, custom reports, and predictive insights powered by AI. Make data-driven decisions.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Live metrics</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> AI predictions</span>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300">
                            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                                <Shield className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-red-600 transition">Enterprise Security</h3>
                            <p className="text-gray-500 leading-relaxed mb-4">
                                Role-based access control, audit logs, and end-to-end encryption. ISO 27001 certified.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> RBAC</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Fingerprint className="w-3 h-3" /> 2FA</span>
                            </div>
                        </div>

                        {/* Communication */}
                        <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300">
                            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                                <MessageSquare className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-green-600 transition">Team Communication</h3>
                            <p className="text-gray-500 leading-relaxed mb-4">
                                In-app chat, video calls, and announcements. Keep everyone connected and aligned.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Chat</span>
                                <span>•</span>
                                {/* <span className="flex items-center gap-1"><Video className="w-3 h-3" /> HD calls</span> */}
                            </div>
                        </div>

                        {/* API Access */}
                        <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300">
                            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                                <Zap className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-orange-600 transition">API & Integrations</h3>
                            <p className="text-gray-500 leading-relaxed mb-4">
                                Connect with your favorite tools. RESTful API, webhooks, and Zapier integration.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> REST API</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Webhooks</span>
                            </div>
                        </div>
                    </div>

                    {/* Feature Highlight */}
                    {/* <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                                    🚀 Just Launched
                                </span>
                                <h3 className="text-3xl font-bold mb-4">AI-Powered Insights</h3>
                                <p className="text-blue-100 mb-6">
                                    Our new AI engine analyzes your business data to predict churn, suggest upsells, and identify bottlenecks before they become problems.
                                </p>
                                <ul className="space-y-3">
                                    {['Predictive analytics', 'Automated reports', 'Smart recommendations'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-blue-200" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className="mt-8 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition">
                                    Learn more about AI features
                                </button>
                            </div>
                            <div className="relative">
                                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-semibold">Revenue Forecast</span>
                                        <span className="text-green-300">+23% vs last month</span>
                                    </div>
                                    <div className="h-2 bg-white/20 rounded-full mb-6">
                                        <div className="w-3/4 h-2 bg-green-400 rounded-full"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span>Customer Churn Risk</span>
                                            <span className="text-yellow-300">2.3%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Upsell Opportunities</span>
                                            <span className="text-green-300">₹12.4L</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900">Loved by Teams Across India</h2>
                        <p className="text-gray-500 mt-4">See what our customers have to say about DIFMO CRM</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Rajesh Kumar',
                                role: 'CEO, TechSolutions India',
                                content: 'DIFMO CRM transformed how we manage projects and payroll. The role-based access is a game-changer for our 150+ employee company.',
                                rating: 5,
                                image: 'https://i.pravatar.cc/100?img=7'
                            },
                            {
                                name: 'Priya Sharma',
                                role: 'HR Manager, GrowthX',
                                content: 'Finally a CRM that understands Indian payroll! PF, ESI, TDS all automated. Saved us 20+ hours every month.',
                                rating: 5,
                                image: 'https://i.pravatar.cc/100?img=5'
                            },
                            {
                                name: 'Amit Verma',
                                role: 'Project Lead, InnovateTech',
                                content: 'The analytics dashboard gives us real-time insights into team productivity. Client reporting has never been easier.',
                                rating: 5,
                                image: 'https://i.pravatar.cc/100?img=3'
                            }
                        ].map((testimonial, idx) => (
                            <div key={idx} className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:border-blue-200 transition group">
                                <div className="flex items-center gap-4 mb-6">
                                    <img 
                                        src={testimonial.image} 
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white group-hover:border-blue-400 transition"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                                <div className="flex items-center gap-1 text-yellow-400">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-black text-blue-600">2,000+</div>
                            <div className="text-sm text-gray-500">Active Companies</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-blue-600">50K+</div>
                            <div className="text-sm text-gray-500">Users</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-blue-600">99.9%</div>
                            <div className="text-sm text-gray-500">Uptime SLA</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-blue-600">24/7</div>
                            <div className="text-sm text-gray-500">Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Teaser */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-black text-gray-900 mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-gray-500 mb-12 max-w-2xl mx-auto">Start free, scale as you grow. No hidden fees, no surprises.</p>
                    
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition">
                            <h3 className="text-xl font-bold mb-2">Starter</h3>
                            <div className="text-3xl font-black mb-4">₹0<span className="text-sm font-normal text-gray-500">/mo</span></div>
                            <p className="text-gray-500 text-sm mb-6">Perfect for small teams</p>
                            <ul className="text-left space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /> Up to 5 users</li>
                                <li className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /> Basic project management</li>
                                <li className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /> Attendance tracking</li>
                            </ul>
                            <Link to="/company-registration" className="block w-full bg-gray-900 text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition">
                                Get Started
                            </Link>
                        </div>

                        {/* Pro Plan - Highlighted */}
                        <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-2xl scale-105 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-3 py-1 text-xs font-bold rounded-bl-lg">
                                POPULAR
                            </div>
                            <h3 className="text-xl font-bold mb-2">Professional</h3>
                            <div className="text-3xl font-black mb-4">₹999<span className="text-sm font-normal text-blue-200">/mo</span></div>
                            <p className="text-blue-100 text-sm mb-6">For growing businesses</p>
                            <ul className="text-left space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-blue-200" /> Up to 25 users</li>
                                <li className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-blue-200" /> Advanced analytics</li>
                                <li className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-blue-200" /> Automated payroll</li>
                                <li className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-blue-200" /> Priority support</li>
                            </ul>
                            <Link to="/company-registration" className="block w-full bg-white text-blue-600 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                                Start Free Trial
                            </Link>
                        </div>

                        {/* Enterprise */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition">
                            <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                            <div className="text-3xl font-black mb-4">Custom</div>
                            <p className="text-gray-500 text-sm mb-6">For large organizations</p>
                            <ul className="text-left space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /> Unlimited users</li>
                                <li className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /> Custom integrations</li>
                                <li className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /> Dedicated account manager</li>
                            </ul>
                            <button onClick={() => navigate('/contact')} className="block w-full bg-gray-900 text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white text-center">
                        <h2 className="text-3xl font-bold mb-4">Stay Ahead of the Curve</h2>
                        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                            Get product updates, CRM tips, and industry insights delivered to your inbox.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="flex-1 px-6 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                            />
                            <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition whitespace-nowrap">
                                Subscribe
                            </button>
                        </div>
                        <p className="text-xs text-blue-200 mt-4">
                            We respect your privacy. Unsubscribe at any time.
                        </p>
                    </div>
                </div>
            </section>

            {/* Modern Footer */}
            <footer className="bg-gray-900 text-gray-300 pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
                        {/* Company Info */}
                        <div className="col-span-2">
                            <span className="text-2xl font-black text-white">DIFMO</span>
                            <span className="text-gray-500 ml-1">CRM</span>
                            <p className="mt-4 text-gray-500 text-sm leading-relaxed">
                                Revolutionizing business management for the next generation of Indian entrepreneurs.
                            </p>
                            <div className="flex gap-4 mt-6">
                                <a href="#" className="text-gray-400 hover:text-white transition"><Twitter className="w-5 h-5" /></a>
                                <a href="#" className="text-gray-400 hover:text-white transition"><Linkedin className="w-5 h-5" /></a>
                                <a href="#" className="text-gray-400 hover:text-white transition"><Facebook className="w-5 h-5" /></a>
                                <a href="#" className="text-gray-400 hover:text-white transition"><Youtube className="w-5 h-5" /></a>
                            </div>
                        </div>

                        {/* Product */}
                        <div>
                            <h4 className="text-white font-bold mb-4 text-sm">Product</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/features" className="hover:text-blue-400 transition">Features</Link></li>
                                <li><Link to="/pricing" className="hover:text-blue-400 transition">Pricing</Link></li>
                                <li><Link to="/integrations" className="hover:text-blue-400 transition">Integrations</Link></li>
                                <li><Link to="/roadmap" className="hover:text-blue-400 transition">Roadmap</Link></li>
                            </ul>
                        </div>

                        {/* Solutions */}
                        <div>
                            <h4 className="text-white font-bold mb-4 text-sm">Solutions</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/small-business" className="hover:text-blue-400 transition">Small Business</Link></li>
                                <li><Link to="/enterprise" className="hover:text-blue-400 transition">Enterprise</Link></li>
                                <li><Link to="/startups" className="hover:text-blue-400 transition">Startups</Link></li>
                                <li><Link to="/agencies" className="hover:text-blue-400 transition">Agencies</Link></li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className="text-white font-bold mb-4 text-sm">Resources</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/blog" className="hover:text-blue-400 transition">Blog</Link></li>
                                <li><Link to="/guides" className="hover:text-blue-400 transition">Guides</Link></li>
                                <li><Link to="/webinars" className="hover:text-blue-400 transition">Webinars</Link></li>
                                <li><Link to="/case-studies" className="hover:text-blue-400 transition">Case Studies</Link></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-white font-bold mb-4 text-sm">Company</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/about" className="hover:text-blue-400 transition">About Us</Link></li>
                                <li><Link to="/careers" className="hover:text-blue-400 transition">Careers <span className="text-blue-400 text-xs">(Hiring)</span></Link></li>
                                <li><Link to="/contact" className="hover:text-blue-400 transition">Contact</Link></li>
                                <li><Link to="/press" className="hover:text-blue-400 transition">Press</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                        <div>© 2024 DIFMO Private Limited. All rights reserved.</div>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <Link to="/privacy" className="hover:text-gray-300 transition">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-gray-300 transition">Terms of Service</Link>
                            <Link to="/security" className="hover:text-gray-300 transition">Security</Link>
                            <Link to="/sitemap" className="hover:text-gray-300 transition">Sitemap</Link>
                        </div>
                    </div>

                    {/* Made in India Badge */}
                    <div className="mt-8 text-center">
                        <span className="inline-flex items-center gap-2 text-xs text-gray-600">
                            <Heart className="w-3 h-3 text-red-500" /> Made with passion in Lucknow, India
                        </span>
                    </div>
                </div>
            </footer>

            {/* Floating Help Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition group relative">
                    <MessageSquare className="w-6 h-6" />
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                        Need help? Chat with us
                    </span>
                </button>
            </div>

            {/* Cookie Consent (Simplified) */}
            <div className="fixed bottom-6 left-6 bg-white rounded-lg shadow-2xl p-4 max-w-sm border border-gray-200 z-50 hidden md:block">
                <p className="text-sm text-gray-600 mb-3">
                    We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                </p>
                <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition">
                        Accept
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-200 transition">
                        Decline
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
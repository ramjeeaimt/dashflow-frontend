import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    CreditCard, Clock, Briefcase, User, LogOut, ChevronRight,
    CheckCircle2, ShieldCheck, Zap, Users, BarChart2, Globe,
    Settings, Mail, Phone, Calendar, Download, FileText,
    Lock, Fingerprint, Bell, PieChart, Target, TrendingUp,
    Award, Rocket, DollarSign, MessageSquare, Video, Share2,
    Star, Play, X, Menu, Heart, Eye, Server, Database,
    Cloud, Smartphone, Laptop, Monitor, Tablet, GitBranch,
    Layers, Box, Package, Shield, Key, AlertCircle
} from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';

const FeaturesPage = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showDemoVideo, setShowDemoVideo] = useState(false);

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

    // Feature categories
    const featureCategories = [
        { id: 'all', name: 'All Features', icon: <Layers className="w-4 h-4" /> },
        { id: 'payroll', name: 'Payroll & HR', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'projects', name: 'Project Management', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'time', name: 'Time Tracking', icon: <Clock className="w-4 h-4" /> },
        { id: 'analytics', name: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
        { id: 'security', name: 'Security', icon: <Shield className="w-4 h-4" /> }
    ];

    // Comprehensive features list
    const allFeatures = [
        // Payroll & HR Features
        {
            id: 1,
            title: "Smart Payroll Automation",
            category: "payroll",
            icon: <CreditCard size={24} />,
            description: "Stop manually calculating salaries. Our engine syncs directly with attendance and leave tables to generate precise monthly disbursements in seconds.",
            longDescription: "Fully automated payroll processing with TDS, PF, ESI, and PT calculations. Generate salary slips, bank files, and tax reports with one click.",
            color: "bg-emerald-500",
            gradient: "from-emerald-500 to-teal-500",
            shadow: "shadow-emerald-200",
            bullets: [
                "Automated TDS/ESI/PF calculations",
                "Bank file generation (HDFC, ICICI, SBI)",
                "Digital salary slips with QR verification",
                "Year-end Form 16 generation"
            ],
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Time Saved", value: "85%", icon: <Clock className="w-4 h-4" /> },
            popular: true
        },
        {
            id: 2,
            title: "Leave & Attendance Management",
            category: "payroll",
            icon: <Calendar size={24} />,
            description: "Comprehensive leave tracking with multiple leave types, accruals, and approval workflows integrated with payroll.",
            longDescription: "Manage all types of leave (CL, SL, PL, LWP) with automatic accrual based on company policy. Geo-fenced attendance marking.",
            color: "bg-blue-600",
            gradient: "from-blue-600 to-indigo-600",
            shadow: "shadow-blue-200",
            bullets: [
                "Multiple leave types & policies",
                "Geo-fenced attendance marking",
                "Automatic leave accrual",
                "Leave balance reports"
            ],
            image: "https://images.unsplash.com/photo-1434626881859-194d67c2b86f?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Accuracy", value: "99.9%", icon: <CheckCircle2 className="w-4 h-4" /> }
        },
        {
            id: 3,
            title: "Employee Self-Service Portal",
            category: "payroll",
            icon: <Users size={24} />,
            description: "Empower employees with self-service access to payslips, leave applications, and personal information updates.",
            longDescription: "Employees can view payslips, apply for leave, request overtime, and update personal details without HR intervention.",
            color: "bg-purple-600",
            gradient: "from-purple-600 to-pink-600",
            shadow: "shadow-purple-200",
            bullets: [
                "View digital payslips anytime",
                "Apply for leave & track status",
                "Update personal information",
                "Download tax declarations"
            ],
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "HR Time Saved", value: "15h/week", icon: <Clock className="w-4 h-4" /> }
        },

        // Project Management Features
        {
            id: 4,
            title: "Advanced Project Tracking",
            category: "projects",
            icon: <Briefcase size={24} />,
            description: "From 'add-project' to final delivery. Manage tasks, clients, and internal teams through a unified pipeline.",
            longDescription: "Complete project lifecycle management with milestones, dependencies, and resource allocation. Multiple view options including Kanban, Gantt, and Calendar.",
            color: "bg-indigo-600",
            gradient: "from-indigo-600 to-blue-600",
            shadow: "shadow-indigo-200",
            bullets: [
                "Kanban, Gantt & Calendar views",
                "Task dependencies & milestones",
                "Resource allocation & capacity planning",
                "Client portal for collaboration"
            ],
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Productivity Boost", value: "40%", icon: <TrendingUp className="w-4 h-4" /> }
        },
        {
            id: 5,
            title: "Agile Development Tools",
            category: "projects",
            icon: <GitBranch size={24} />,
            description: "Built for development teams with sprint planning, backlog management, and GitHub/GitLab integration.",
            longDescription: "Full agile support with sprints, epics, user stories, and story points. Direct integration with popular version control systems.",
            color: "bg-orange-600",
            gradient: "from-orange-600 to-red-600",
            shadow: "shadow-orange-200",
            bullets: [
                "Sprint planning & velocity tracking",
                "Backlog grooming tools",
                "GitHub/GitLab integration",
                "Burndown charts & reports"
            ],
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Sprint Success", value: "+35%", icon: <Award className="w-4 h-4" /> }
        },
        {
            id: 6,
            title: "Resource Management",
            category: "projects",
            icon: <Users size={24} />,
            description: "Optimize team utilization with real-time workload views and capacity planning tools.",
            longDescription: "See who's overworked and who has bandwidth. Allocate resources efficiently across projects and track utilization rates.",
            color: "bg-cyan-600",
            gradient: "from-cyan-600 to-blue-600",
            shadow: "shadow-cyan-200",
            bullets: [
                "Workload balancing",
                "Capacity planning",
                "Skill-based assignment",
                "Utilization reports"
            ],
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Utilization Rate", value: "92%", icon: <Target className="w-4 h-4" /> }
        },

        // Time Tracking Features
        {
            id: 7,
            title: "Precise Time Tracking",
            category: "time",
            icon: <Clock size={24} />,
            description: "Capture every billable second. Real-time visibility into productivity without micro-managing.",
            longDescription: "Track time against projects and tasks with start/stop timers, manual entry, and timesheet approvals. Billable vs non-billable tracking.",
            color: "bg-blue-600",
            gradient: "from-blue-600 to-sky-600",
            shadow: "shadow-blue-200",
            bullets: [
                "Start/stop timers",
                "Timesheet approvals",
                "Billable hours tracking",
                "Idle time detection"
            ],
            image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Accuracy", value: "99.5%", icon: <CheckCircle2 className="w-4 h-4" /> },
            popular: true
        },
        {
            id: 8,
            title: "Multi-Device Sync",
            category: "time",
            icon: <Smartphone size={24} />,
            description: "Track time from any device - web, mobile, or desktop. Perfect for remote and hybrid teams.",
            longDescription: "Mobile app with offline support, desktop timer widget, and browser extension. All data syncs seamlessly across devices.",
            color: "bg-green-600",
            gradient: "from-green-600 to-emerald-600",
            shadow: "shadow-green-200",
            bullets: [
                "iOS & Android apps",
                "Desktop timer widget",
                "Browser extension",
                "Offline support"
            ],
            image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Supported Devices", value: "6+", icon: <Smartphone className="w-4 h-4" /> }
        },
        {
            id: 9,
            title: "Project Profitability",
            category: "time",
            icon: <DollarSign size={24} />,
            description: "Track billable hours against budgets and see real-time project profitability.",
            longDescription: "Set project budgets, track actual vs planned hours, and calculate profitability with cost rates and billing rates.",
            color: "bg-yellow-600",
            gradient: "from-yellow-600 to-orange-600",
            shadow: "shadow-yellow-200",
            bullets: [
                "Budget vs actual tracking",
                "Profit margin calculations",
                "Client billing reports",
                "Cost rate management"
            ],
            image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Margin Accuracy", value: "+25%", icon: <TrendingUp className="w-4 h-4" /> }
        },

        // Analytics Features
        {
            id: 10,
            title: "Real-Time Dashboards",
            category: "analytics",
            icon: <BarChart2 size={24} />,
            description: "Customizable dashboards with real-time metrics on projects, finances, and team performance.",
            longDescription: "Drag-and-drop dashboard builder with 50+ widgets. Create role-specific views for executives, managers, and team leads.",
            color: "bg-purple-600",
            gradient: "from-purple-600 to-indigo-600",
            shadow: "shadow-purple-200",
            bullets: [
                "50+ customizable widgets",
                "Real-time data refresh",
                "Role-based views",
                "Export to PDF/Excel"
            ],
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Data Points", value: "1M+/day", icon: <Database className="w-4 h-4" /> },
            popular: true
        },
        {
            id: 11,
            title: "AI-Powered Insights",
            category: "analytics",
            icon: <Zap size={24} />,
            description: "Predictive analytics that forecast project delays, budget overruns, and resource bottlenecks.",
            longDescription: "Machine learning models analyze historical data to predict outcomes and suggest corrective actions before issues arise.",
            color: "bg-pink-600",
            gradient: "from-pink-600 to-rose-600",
            shadow: "shadow-pink-200",
            bullets: [
                "Delay prediction",
                "Budget forecasting",
                "Resource bottleneck alerts",
                "Trend analysis"
            ],
            image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Prediction Accuracy", value: "94%", icon: <Target className="w-4 h-4" /> }
        },
        {
            id: 12,
            title: "Custom Reports",
            category: "analytics",
            icon: <FileText size={24} />,
            description: "Build custom reports with any combination of data. Schedule automated email reports.",
            longDescription: "Report builder with drag-and-drop interface. Choose from multiple visualization types and schedule recurring reports.",
            color: "bg-indigo-600",
            gradient: "from-indigo-600 to-purple-600",
            shadow: "shadow-indigo-200",
            bullets: [
                "Drag-and-drop builder",
                "Multiple chart types",
                "Scheduled reports",
                "White-label exporting"
            ],
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Report Templates", value: "75+", icon: <FileText className="w-4 h-4" /> }
        },

        // Security Features
        {
            id: 13,
            title: "Role-Based Access Control",
            category: "security",
            icon: <Users size={24} />,
            description: "Granular permissions for every action. Define custom roles with specific access levels.",
            longDescription: "Create unlimited custom roles with permissions for each module. Inherit or override permissions at project level.",
            color: "bg-red-600",
            gradient: "from-red-600 to-rose-600",
            shadow: "shadow-red-200",
            bullets: [
                "Unlimited custom roles",
                "Module-level permissions",
                "Project-level overrides",
                "Access audit trails"
            ],
            image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Permission Levels", value: "100+", icon: <Shield className="w-4 h-4" /> }
        },
        {
            id: 14,
            title: "Enterprise Encryption",
            category: "security",
            icon: <Lock size={24} />,
            description: "AES-256 encryption at rest and TLS 1.3 in transit. Your data is always protected.",
            longDescription: "Bank-grade encryption for all data. Field-level encryption for sensitive information like salaries and personal data.",
            color: "bg-gray-800",
            gradient: "from-gray-800 to-gray-900",
            shadow: "shadow-gray-200",
            bullets: [
                "AES-256 encryption at rest",
                "TLS 1.3 in transit",
                "Field-level encryption",
                "Encrypted backups"
            ],
            image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Security Standard", value: "ISO 27001", icon: <Award className="w-4 h-4" /> }
        },
        {
            id: 15,
            title: "Two-Factor Authentication",
            category: "security",
            icon: <Fingerprint size={24} />,
            description: "Multiple 2FA options including authenticator apps, SMS, and biometric authentication.",
            longDescription: "Protect accounts with 2FA. Support for Google Authenticator, Microsoft Authenticator, SMS codes, and biometrics on mobile.",
            color: "bg-blue-800",
            gradient: "from-blue-800 to-indigo-800",
            shadow: "shadow-blue-200",
            bullets: [
                "Authenticator apps",
                "SMS verification",
                "Biometric support",
                "Remember device option"
            ],
            image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "2FA Methods", value: "5", icon: <Key className="w-4 h-4" /> }
        },

        // Additional Features
        {
            id: 16,
            title: "Client Portal",
            category: "all",
            icon: <Globe size={24} />,
            description: "Give clients secure access to project progress, invoices, and reports.",
            longDescription: "Branded client portal where clients can view project status, approve deliverables, and download invoices.",
            color: "bg-teal-600",
            gradient: "from-teal-600 to-cyan-600",
            shadow: "shadow-teal-200",
            bullets: [
                "Branded portal",
                "File sharing",
                "Approval workflows",
                "Invoice viewing"
            ],
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Client Satisfaction", value: "4.9/5", icon: <Star className="w-4 h-4" /> }
        },
        {
            id: 17,
            title: "Team Communication",
            category: "all",
            icon: <MessageSquare size={24} />,
            description: "Built-in chat, video calls, and announcements. Keep everyone connected.",
            longDescription: "Real-time messaging with threads, file sharing, and emoji reactions. Integrated video calls and team announcements.",
            color: "bg-violet-600",
            gradient: "from-violet-600 to-purple-600",
            shadow: "shadow-violet-200",
            bullets: [
                "Real-time chat",
                "Video calls (up to 50 participants)",
                "Team announcements",
                "File sharing"
            ],
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Messages/month", value: "2M+", icon: <MessageSquare className="w-4 h-4" /> }
        },
        {
            id: 18,
            title: "API & Integrations",
            category: "all",
            icon: <GitBranch size={24} />,
            description: "RESTful API and pre-built integrations with popular tools like Slack, GitHub, and Zapier.",
            longDescription: "Full API access for custom integrations. Pre-built connectors for Slack, GitHub, Google Workspace, and 100+ other tools.",
            color: "bg-amber-600",
            gradient: "from-amber-600 to-orange-600",
            shadow: "shadow-amber-200",
            bullets: [
                "RESTful API",
                "Webhook support",
                "Zapier integration",
                "Slack & Teams connectors"
            ],
            image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1000",
            stats: { label: "Integrations", value: "100+", icon: <Box className="w-4 h-4" /> }
        }
    ];

    // Filter features based on active tab
    const filteredFeatures = activeTab === 'all' 
        ? allFeatures 
        : allFeatures.filter(f => f.category === activeTab);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Sticky Navigation */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <Link to="/" className="flex items-center gap-2">
                                <span className="text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    DIFMO
                                </span>
                                {/* <span className="text-2xl font-light text-gray-400">/</span> */}
                                <span className="text-2xl font-extrabold text-gray-700">CRM</span>
                            </Link>
                            <div className="hidden md:flex items-center space-x-1 ml-4">
                                <button 
                                    onClick={() => navigate('/features')} 
                                    className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg border-b-2 border-blue-600"
                                >
                                    Features
                                </button>
                                <Link to="/pricing" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Pricing</Link>
                                {/* <Link to="/security" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Security</Link> */}
                                <Link to="/privacy-policy" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Privacy</Link>
                                {/* <Link to="/customers" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Customers</Link> */}
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
                                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all text-sm font-semibold flex items-center gap-2"
                                    >
                                        Start Free Trial <Rocket className="w-4 h-4" />
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
                                <button onClick={() => navigate('/features')} className="px-3 py-2 text-left text-blue-600 bg-blue-50 rounded-lg">Features</button>
                                <Link to="/pricing" className="px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">Pricing</Link>
                                <Link to="/security" className="px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">Security</Link>
                                <Link to="/privacy-policy" className="px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">Privacy</Link>
                                <Link to="/customers" className="px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">Customers</Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Personalized Welcome for Auth Users */}
            {isAuthenticated && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5" />
                                <p className="text-sm">
                                    Welcome back, <span className="font-bold">{getFullName()}</span>! Explore features you haven't tried yet.
                                </p>
                            </div>
                            <Link 
                                to="/dashboard" 
                                className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
                            >
                                Go to Dashboard <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 py-24 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm mb-8">
                            <Zap className="w-4 h-4" />
                            {/* <span>New: AI-powered insights now available</span> */}
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                            Everything Your Team Needs
                            <span className="block text-2xl md:text-3xl font-light mt-4 text-blue-200">
                                In One Powerful Platform
                            </span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                            18+ integrated modules. 100+ features. Zero compromises.
                            Built for Indian businesses, trusted by 2,000+ companies.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                to="/company-registration" 
                                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition shadow-2xl flex items-center justify-center gap-2 group"
                            >
                                Start 14-day Free Trial <Rocket className="w-4 h-4 group-hover:translate-x-1 transition" />
                            </Link>
                            <button 
                                onClick={() => setShowDemoVideo(true)}
                                className="bg-white/20 backdrop-blur text-white px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition flex items-center justify-center gap-2 border border-white/30"
                            >
                                <Play className="w-4 h-4" /> Watch Demo Video
                            </button>
                        </div>
                        
                        {/* Trust badges */}
                        <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-blue-200">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                <span>ISO 27001 Certified</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>2,000+ Active Teams</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Server className="w-4 h-4" />
                                <span>99.9% Uptime SLA</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                <span>Data Sovereignty in India</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave separator */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
                    </svg>
                </div>
            </div>

            {/* Feature Categories Filter */}
            <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex overflow-x-auto hide-scrollbar gap-2 py-4">
                        {featureCategories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveTab(category.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                                    activeTab === category.id
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {category.icon}
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black text-gray-900 mb-4">
                        {activeTab === 'all' ? 'All Features' : featureCategories.find(c => c.id === activeTab)?.name}
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {activeTab === 'all' 
                            ? 'Discover everything DIFMO CRM has to offer. From payroll to project management, we\'ve got you covered.'
                            : `Explore our ${featureCategories.find(c => c.id === activeTab)?.name.toLowerCase()} features designed to streamline your workflow.`}
                    </p>
                </div>

                <div className="space-y-32">
                    {filteredFeatures.map((feature, index) => (
                        <div 
                            key={feature.id} 
                            className={`flex flex-col lg:flex-row gap-12 items-center ${
                                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                            }`}
                        >
                            {/* Content Side */}
                            <div className="flex-1 space-y-6">
                                {/* Popular Badge */}
                                {feature.popular && (
                                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-bold">
                                        <Award className="w-4 h-4" />
                                        Most Popular
                                    </div>
                                )}

                                {/* Icon and Title */}
                                <div className={`bg-gradient-to-r ${feature.gradient} w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl`}>
                                    {feature.icon}
                                </div>
                                
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                                    {feature.title}
                                </h2>
                                
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    {feature.longDescription || feature.description}
                                </p>

                                {/* Feature Bullets */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    {feature.bullets.map((bullet, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{bullet}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Stats Card */}
                                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 mt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">{feature.stats.label}</p>
                                            <p className="text-3xl font-bold text-gray-900">{feature.stats.value}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                            {feature.stats.icon}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <Link 
                                        to="/company-registration" 
                                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                                    >
                                        Try it free <ChevronRight className="w-4 h-4" />
                                    </Link>
                                    <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition">
                                        Learn more
                                    </button>
                                </div>
                            </div>

                            {/* Image Side */}
                            <div className="flex-1 w-full group">
                                <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500">
                                    {/* Browser Chrome */}
                                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                        <div className="flex-1 flex justify-center">
                                            <div className="bg-white px-4 py-1 rounded-full text-xs text-gray-500 border border-gray-200">
                                                {feature.title}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Image */}
                                    <img 
                                        src={feature.image} 
                                        alt={feature.title}
                                        className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    
                                    {/* Overlay with feature name */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-6">
                                        <p className="text-white text-sm font-medium opacity-90">
                                            Live preview • {feature.title}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {filteredFeatures.length === 0 && (
                    <div className="text-center py-20">
                        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No features found</h3>
                        <p className="text-gray-500">Try selecting a different category</p>
                    </div>
                )}
            </div>

            {/* Demo Video Modal */}
            {showDemoVideo && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="font-bold text-lg">Product Demo</h3>
                            <button 
                                onClick={() => setShowDemoVideo(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="aspect-video bg-black">
                            <img 
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80" 
                                alt="Demo Video Placeholder"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-4 text-center text-sm text-gray-500">
                            Watch how DIFMO CRM transforms your business operations
                        </div>
                    </div>
                </div>
            )}

            {/* How It Works Section */}
            <div className="bg-gray-50 py-24 border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-blue-600 font-bold text-sm uppercase tracking-wider">Simple Process</span>
                        <h2 className="text-4xl font-black text-gray-900 mt-2">Get Started in 3 Steps</h2>
                        <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">
                            From signup to full implementation in less than 5 minutes
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Progress Line */}
                        <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"></div>

                        {/* Step 1 */}
                        <div className="relative text-center group">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl rotate-45 transform group-hover:rotate-0 transition-all duration-500 shadow-xl mb-8">
                                <div className="w-full h-full flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-all duration-500">
                                    <span className="text-3xl font-black text-white">01</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Create Account</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-4">
                                Sign up with your company details. Get your dedicated instance on our secure cloud.
                            </p>
                            <div className="mt-4 inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                                <Clock className="w-3 h-3" /> Takes 2 minutes
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative text-center group">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl rotate-45 transform group-hover:rotate-0 transition-all duration-500 shadow-xl mb-8">
                                <div className="w-full h-full flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-all duration-500">
                                    <span className="text-3xl font-black text-white">02</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Import Your Team</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-4">
                                Bulk upload employees via Excel or invite them individually. Assign roles instantly.
                            </p>
                            <div className="mt-4 flex justify-center -space-x-2">
                                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/32?img=1" alt="Team" />
                                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/32?img=2" alt="Team" />
                                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/32?img=3" alt="Team" />
                                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center border-2 border-white">+12</span>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative text-center group">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl rotate-45 transform group-hover:rotate-0 transition-all duration-500 shadow-xl mb-8">
                                <div className="w-full h-full flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-all duration-500">
                                    <span className="text-3xl font-black text-white">03</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Go Live</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-4">
                                Start tracking projects, attendance, and payroll. Watch your business grow.
                            </p>
                            <div className="mt-4 flex items-center justify-center gap-1 text-green-600">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs font-medium">40% efficiency gain</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integration Partners */}
            <div className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Seamlessly integrates with</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60 hover:opacity-100 transition">
                        <div className="text-2xl font-bold text-gray-700">Slack</div>
                        <div className="text-2xl font-bold text-gray-700">GitHub</div>
                        <div className="text-2xl font-bold text-gray-700">Google</div>
                        <div className="text-2xl font-bold text-gray-700">Zapier</div>
                        <div className="text-2xl font-bold text-gray-700">Microsoft</div>
                        <div className="text-2xl font-bold text-gray-700">Zoom</div>
                        <div className="text-2xl font-bold text-gray-700">Salesforce</div>
                        <div className="text-2xl font-bold text-gray-700">QuickBooks</div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
                <div className="max-w-7xl mx-auto px-4 text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">
                        Ready to Transform Your Business?
                    </h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Join 2,000+ Indian companies already using DIFMO CRM to streamline operations and boost productivity.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            to="/company-registration" 
                            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition shadow-2xl flex items-center justify-center gap-2 group text-lg"
                        >
                            Start 14-day Free Trial <Rocket className="w-5 h-5 group-hover:translate-x-1 transition" />
                        </Link>
                        <Link 
                            to="/contact" 
                            className="bg-white/20 backdrop-blur text-white px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition border border-white/30"
                        >
                            Contact Sales
                        </Link>
                    </div>
                    <p className="text-sm text-blue-200 mt-6">
                        No credit card required • Full access • Cancel anytime
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
                        <div className="col-span-2">
                            <span className="text-2xl font-black text-white">DIFMO</span>
                            <span className="text-gray-500 ml-1">CRM</span>
                            <p className="mt-4 text-gray-500 text-sm leading-relaxed max-w-xs">
                                The complete business management platform for modern Indian companies.
                            </p>
                            {/* <div className="flex gap-4 mt-6">
                                <a href="#" className="text-gray-400 hover:text-white transition"><Twitter className="w-5 h-5" /></a>
                                <a href="#" className="text-gray-400 hover:text-white transition"><Linkedin className="w-5 h-5" /></a>
                                <a href="#" className="text-gray-400 hover:text-white transition"><Facebook className="w-5 h-5" /></a>
                                <a href="#" className="text-gray-400 hover:text-white transition"><Youtube className="w-5 h-5" /></a>
                            </div> */}
                        </div>
                        
                        <div>
                            <h4 className="text-white font-bold mb-4 text-sm">Product</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/features" className="hover:text-blue-400 transition">Features</Link></li>
                                <li><Link to="/pricing" className="hover:text-blue-400 transition">Pricing</Link></li>
                                <li><Link to="/integrations" className="hover:text-blue-400 transition">Integrations</Link></li>
                                <li><Link to="/changelog" className="hover:text-blue-400 transition">Changelog</Link></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-white font-bold mb-4 text-sm">Solutions</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/small-business" className="hover:text-blue-400 transition">Small Business</Link></li>
                                <li><Link to="/enterprise" className="hover:text-blue-400 transition">Enterprise</Link></li>
                                <li><Link to="/startups" className="hover:text-blue-400 transition">Startups</Link></li>
                                <li><Link to="/agencies" className="hover:text-blue-400 transition">Agencies</Link></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-white font-bold mb-4 text-sm">Resources</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/blog" className="hover:text-blue-400 transition">Blog</Link></li>
                                <li><Link to="/guides" className="hover:text-blue-400 transition">Guides</Link></li>
                                <li><Link to="/webinars" className="hover:text-blue-400 transition">Webinars</Link></li>
                                <li><Link to="/api-docs" className="hover:text-blue-400 transition">API Docs</Link></li>
                            </ul>
                        </div>
                        
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

                    <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                        <div>© 2026 DIFMO-CRM. All rights reserved.</div>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <Link to="/privacy" className="hover:text-gray-300 transition">Privacy</Link>
                            <Link to="/terms" className="hover:text-gray-300 transition">Terms</Link>
                            <Link to="/security" className="hover:text-gray-300 transition">Security</Link>
                            <Link to="/sitemap" className="hover:text-gray-300 transition">Sitemap</Link>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-xs text-gray-600">
                        Made with <Heart className="w-3 h-3 inline text-red-500" /> in Lucknow, India
                    </div>
                </div>
            </footer>

            {/* Floating Help Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition group relative">
                    <MessageSquare className="w-6 h-6" />
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                        Questions? Chat with us
                    </span>
                </button>
            </div>
        </div>
    );
};

export default FeaturesPage;
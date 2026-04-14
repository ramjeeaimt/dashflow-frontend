import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, ArrowRight, User, LogOut, Zap, Shield, Crown } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore'; // Adjust path based on your project structure

const Pricing = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isAnnual, setIsAnnual] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const plans = [
        {
            name: "Basic",
            icon: <Zap className="text-black" size={24} />,
            price: isAnnual ? "1,999" : "2,499",
            description: "Perfect for small teams getting started with CRM.",
            features: ["Up to 10 Employees", "Basic Project Tracking", "Client Management", "Email Support"],
            buttonText: "Start Free Trial",
            highlight: false
        },
        {
            name: "Business",
            icon: <Shield className="text-black" size={24} />,
            price: isAnnual ? "4,999" : "5,999",
            description: "Advanced ERP features for growing companies.",
            features: ["Unlimited Employees", "Payroll & Expense Module", "RBAC Permissions", "Priority Support", "Audit Logs"],
            buttonText: "Go Business",
            highlight: true
        },
        {
            name: "Enterprise",
            icon: <Crown className="text-black" size={24} />,
            price: "Custom",
            description: "Full customization and dedicated infrastructure.",
            features: ["Dedicated NeonDB Instance", "Custom API Integrations", "24/7 Account Manager", "White-label Branding"],
            buttonText: "Contact Sales",
            highlight: false
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Consistent Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-8">
                            <Link to="/" className="text-2xl font-extrabold tracking-tighter text-blue-600">
                                DIFMO<span className="text-gray-900">CRM</span>
                            </Link>
                            <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
                                <Link to="/features" className="hover:text-blue-600 transition">Features</Link>
                                <Link to="/pricing" className="text-blue-600 font-bold border-b-2 border-blue-600">Pricing</Link>
                                <Link to="/privacy-policy" className="hover:text-blue-600 transition">Privacy</Link>
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
                                <Link to="/login" className="bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition text-sm font-semibold">
                                    Get Started
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Header Section */}
            <div className="py-20 text-center px-4">
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-4">
                    Transparent <span className="text-blue-600">Pricing</span>
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-10">
                    Choose the plan that fits your business needs. Scale your CRM as you grow.
                </p>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-4 mb-16">
                    <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>Monthly</span>
                    <button 
                        onClick={() => setIsAnnual(!isAnnual)}
                        className="w-14 h-8 bg-blue-600 rounded-full relative transition-colors duration-300"
                    >
                        <div className={`absolute top-1 bg-white w-6 h-6 rounded-full transition-all duration-300 ${isAnnual ? 'left-7' : 'left-1'}`} />
                    </button>
                    <span className={`text-sm ${isAnnual ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                        Annual <span className="text-green-500 font-bold text-xs ml-1">(Save 20%)</span>
                    </span>
                </div>

                {/* Pricing Grid */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <div 
                            key={idx}
                            className={`relative bg-white p-8 rounded-3xl border ${plan.highlight ? 'border-blue-600 shadow-2xl shadow-blue-100 ring-4 ring-blue-50' : 'border-gray-200 shadow-xl shadow-gray-100'} transition-transform hover:-translate-y-2`}
                        >
                            {plan.highlight && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                                    Most Popular
                                </span>
                            )}
                            <div className="mb-6">{plan.icon}</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                            <p className="text-gray-500 text-sm mb-6">{plan.description}</p>
                            
                            <div className="mb-8">
                                <span className="text-4xl font-black text-gray-900">₹{plan.price}</span>
                                {plan.price !== "Custom" && <span className="text-gray-500">/mo</span>}
                            </div>

                            <ul className="space-y-4 mb-10">
                                {plan.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-center gap-3 text-sm text-gray-600">
                                        <Check size={18} className="text-green-500 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => navigate('/company-registration')}
                                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition ${plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-900 text-white hover:bg-black'}`}
                            >
                                {plan.buttonText} <ArrowRight size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Note */}
            <div className="text-center py-10 text-gray-400 text-sm">
                Prices are in INR. No hidden charges. Cancel anytime.
            </div>
        </div>
    );
};

export default Pricing;
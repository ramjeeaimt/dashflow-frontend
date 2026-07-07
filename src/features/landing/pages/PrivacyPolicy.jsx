import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-card font-sans">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-primary hover:text-primary font-bold transition-all"
                        >
                            <ArrowLeft size={18} />
                            <span>Go Back</span>
                        </button>

                        <Link to="/" className="text-xl font-bold text-foreground">
                            DashFlow
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-8 py-16">
                <div>
                    {/* Title */}
                        <h1 className="text-6xl font-semibold text-red-600 mb-2 uppercase tracking-tighter">
                            Privacy Policy
                        </h1>
                        <p className="text-base font-bold text-primary uppercase tracking-wide">
                            Effective Date: April 14, 2026
                        </p>

                    {/* Body */}
                    <div className="space-y-16 text-xl text-foreground leading-relaxed">

                        <section className="text-2xl font-bold text-foreground">
                            This Privacy Policy is prepared by <span className="text-red-600">DashFlow</span> ("We", "Us", or "Our").
                            We are committed to protecting and preserving the privacy of our visitors.
                        </section>

                        <div className="divide-y divide-border">
                            <PolicySection
                                id="1"
                                title="About the App"
                                content="DashFlow is an employee management application that allows users to manage employee records, attendance, and salary details."
                            />

                            <PolicySection
                                id="2"
                                title="Information We Collect"
                                content="We may collect your name, email, phone number, and other details when you interact with the app."
                            />

                            <PolicySection
                                id="3"
                                title="How We Use Data"
                                content={
                                    <ul className="list-disc pl-5 space-y-2 mt-4">
                                        <li>Manage employee data</li>
                                        <li>Track attendance</li>
                                        <li>Generate salary profiles</li>
                                        <li>Improve user experience</li>
                                    </ul>
                                }
                            />

                            <PolicySection
                                id="4"
                                title="Data Sharing"
                                content="We do NOT sell user data. We only share data when required by law or for app functionality."
                            />

                            <PolicySection
                                id="5"
                                title="Security"
                                content="We implement industry-standard security measures to protect your data from unauthorized access."
                            />

                            <PolicySection
                                id="6"
                                title="User Rights"
                                content={
                                    <div>
                                        <p>You can access, update, or delete your data anytime.</p>
                                        <p className="mt-4 font-bold text-primary">
                                            Contact support: <a href="mailto:difmotech@gmail.com" className="underline hover:text-red-600">difmotech@gmail.com</a>
                                        </p>
                                    </div>
                                }
                            />

                            <PolicySection
                                id="7"
                                title="Third-Party Services"
                                content="We may use services like Firebase for authentication or basic analytics tools to improve performance."
                            />

                            {/* App Access Section Simplified */}
                            <section className="py-12">
                                <h2 className="text-3xl font-semibold text-red-600 mb-8 uppercase tracking-tight">
                                    08. App Access Instructions
                                </h2>

                                <div className="space-y-12 pl-0 sm:pl-4">
                                    <div className="grid sm:grid-cols-2 gap-12">
                                        <div>
                                            <p className="text-primary text-sm font-bold uppercase mb-4">Demo Credentials</p>
                                            <div className="p-6 border border-border rounded-none space-y-2 font-mono text-lg">
                                                <p><span className="text-muted-foreground/70">EMAIL:</span> test@dashflow.com</p>
                                                <p><span className="text-muted-foreground/70">PASS:</span> 123456</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-primary text-sm font-bold uppercase mb-4">How to Login</p>
                                            <ol className="list-decimal pl-5 space-y-4 text-lg text-muted-foreground">
                                                <li>Navigate to the login screen</li>
                                                <li>Enter the provided credentials</li>
                                                <li>Click the Login button to access the dashboard</li>
                                            </ol>
                                        </div>
                                    </div>

                                    <div className="p-4 text-sm text-muted-foreground/70 border-t border-slate-50 italic">
                                        Authorized access allows for employee management, attendance tracking, and payroll processing.
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-20 pt-8 border-t border-border flex justify-between text-xs font-bold text-muted-foreground/70 uppercase tracking-wide">
                        <span>Last Updated: April 2026</span>
                        <span>v1.0.0 Stable</span>
                    </div>
                </div>
            </main>

            <footer className="py-12 border-t border-slate-50 text-center text-muted-foreground/70 text-sm font-medium">
                © 2026 DashFlow. All rights reserved.
            </footer>
        </div>
    );
};

const PolicySection = ({ id, title, content }) => (
    <section className="py-16 first:pt-0">
        <h2 className="text-3xl font-semibold text-primary mb-6 flex items-baseline gap-4 uppercase tracking-tight">
            <span className="text-red-600 text-2xl font-mono">{id.padStart(2, '0')}.</span>
            {title}
        </h2>
        <div className="text-xl text-muted-foreground pl-0 sm:pl-12 font-medium">
            {content}
        </div>
    </section>
);

export default PrivacyPolicy;
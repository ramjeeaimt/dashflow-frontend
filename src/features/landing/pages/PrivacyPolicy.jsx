import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft, Info } from 'lucide-react';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-red-100 italic">
            {/* Industrial Header */}
            <header className="bg-white border-b-2 border-slate-900 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-slate-100 hover:bg-slate-900 hover:text-white border-2 border-slate-900 transition-all active:scale-95 shadow-[4px_4px_0px_rgba(15,23,42,0.1)]"
                        >
                            <ArrowLeft size={20} strokeWidth={3} />
                        </button>
                        <Link to="/" className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
                            DashFlow
                        </Link>
                    </div>
                    <div className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                        DOCUMENT_INTERNAL: PRIVACY_PROTOCOL
                    </div>
                </div>
            </header>

            {/* Content Container */}
            <main className="max-w-4xl mx-auto px-8 py-16">
                <div className="bg-white p-2 sm:p-4">
                    
                    {/* Main Title Block */}
                    <div className="border-b-2 border-slate-100 pb-10 mb-12">
                        <h1 className="text-5xl font-black text-red-600 uppercase tracking-tighter leading-none mb-4 italic">
                            Privacy Policy
                        </h1>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            Effective Date: April 14, 2026
                        </p>
                    </div>

                    {/* Policy Body */}
                    <div className="space-y-12 text-slate-900 font-bold leading-relaxed text-sm">
                        
                        <section className="text-lg italic leading-relaxed text-slate-700 p-6 bg-slate-50 border-l-4 border-red-600">
                            This Privacy Policy is prepared by Dashflow ("We", "Us", or "Our"). 
                            We are committed to protecting and preserving the privacy of our visitors when visiting our site or communicating electronically with us.
                        </section>

                        <div className="grid grid-cols-1 gap-12">
                            <PolicySection 
                                id="1" 
                                title="About the App" 
                                content="DashFlow is an employee management application that allows users to manage employee records, attendance, and salary details. The app is publicly available and can be used by individuals or organizations."
                            />

                            <PolicySection 
                                id="2" 
                                title="Types of Information We May Collect from You" 
                                content="We may collect, store, and use the following kinds of personal information about individuals who visit and use our website and social media sites: Information you supply to us, including when you submit a contact/inquiry form. This may include your name, address, e-mail address, and phone number."
                            />

                            <PolicySection 
                                id="3" 
                                title="How We Use Information" 
                                content={
                                    <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600">
                                        <li>Manage employee records</li>
                                        <li>Track attendance</li>
                                        <li>Generate salary information</li>
                                        <li>Improve app functionality and user experience</li>
                                    </ul>
                                }
                            />

                            <PolicySection 
                                id="4" 
                                title="Data Sharing and Disclosure" 
                                content="We do NOT sell, trade, or rent users' personal information to others. We may share data only in the following cases: If required by law, to protect our legal rights, or with trusted service providers (such as cloud storage or analytics tools) only to operate the app."
                            />

                            <PolicySection 
                                id="5" 
                                title="Data Security" 
                                content="We implement appropriate security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction."
                            />

                            <PolicySection 
                                id="6" 
                                title="User Rights" 
                                content={
                                    <>
                                        <p>Users have the right to: Access their data, Request correction of their data, Request deletion of their data.</p>
                                        <div className="mt-4 p-4 border-2 border-red-600 bg-red-50">
                                            To request data deletion, please contact us at <span className="text-red-600">difmotech@gmail.com</span>
                                        </div>
                                    </>
                                }
                            />

                            <PolicySection 
                                id="7" 
                                title="Third-Party Services" 
                                content="Our app may use third-party services such as Firebase, analytics tools, or hosting providers that may collect information in accordance with their own privacy policies."
                            />

                            <PolicySection 
                                id="8" 
                                title="Changes to This Privacy Policy" 
                                content="We may update our Privacy Policy from time to time. Users are advised to review this page periodically for any changes."
                            />

                            <PolicySection 
                                id="9" 
                                title="Contact Us" 
                                content={
                                    <div className="flex items-center gap-4 text-red-600">
                                        <Mail size={18} strokeWidth={3} />
                                        <a href="mailto:difmotech@gmail.com" className="hover:underline">difmotech@gmail.com</a>
                                    </div>
                                }
                            />

                            {/* App Access Instructions Section */}
                            <section className="mt-16 pt-12 border-t-2 border-slate-100">
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3 italic">
                                    <div className="w-8 h-8 bg-red-600 text-white flex items-center justify-center text-xs">10</div>
                                    App Access Instructions for DashFlow
                                </h2>
                                
                                <div className="bg-slate-900 text-white p-8 space-y-6 shadow-[12px_12px_0px_rgba(220,38,38,0.2)]">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 border-b border-white/10 pb-2">Credentials_Package</p>
                                    <div className="space-y-2">
                                        <p className="text-lg"><span className="text-slate-400 uppercase text-xs mr-2">Email:</span> test@dashflow.com</p>
                                        <p className="text-lg"><span className="text-slate-400 uppercase text-xs mr-2">Password:</span> 123456</p>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 border-b border-white/10 pb-2">Execution_Steps</p>
                                        <ol className="list-decimal pl-5 space-y-2 text-sm italic">
                                            <li>Open the DashFlow app</li>
                                            <li>Enter the above email and password on the login screen</li>
                                            <li>Tap on Login</li>
                                        </ol>
                                    </div>

                                    <div className="pt-4 p-4 border border-white/20 bg-white/5 text-xs text-slate-300 leading-relaxed italic">
                                        After login, you will be able to: View employee records, Mark attendance, Manage salary details.
                                        No additional permissions or approvals are required to access the app.
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Last Updated: April 14, 2025</span>
                        <span className="text-slate-100">INTERNAL_V1.5</span>
                    </div>
                </div>
            </main>

            {/* Global Footer */}
            <footer className="py-12 bg-white border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-8 text-center text-slate-300">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                        © 2026 DashFlow Ecosystem. All Protocol Reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

const PolicySection = ({ id, title, content }) => (
    <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3 italic">
            <div className="w-8 h-8 bg-red-600 text-white flex items-center justify-center text-xs">
                {id}
            </div>
            {title}
        </h2>
        <div className="text-slate-700 italic leading-relaxed pl-11">
            {content}
        </div>
    </section>
);

export default PrivacyPolicy;
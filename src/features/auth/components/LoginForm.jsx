import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

const LoginForm = ({ onSubmit, isLoading, error, clearError, onForgotPasswordClick }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(email, password);
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
                <div className="flex items-start gap-2.5 bg-error/10 border border-error/20 text-error rounded-md p-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email address
                </label>
                <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        className="block w-full pl-10 pr-3 h-11 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearError(); }}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Password
                </label>
                <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        className="block w-full pl-10 pr-10 h-11 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); clearError(); }}
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-end">
                <button
                    type="button"
                    onClick={onForgotPasswordClick}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Forgot password?
                </button>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="group w-full h-11 flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Signing in…
                    </>
                ) : (
                    <>
                        Sign in
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                )}
            </button>
        </form>
    );
};

export default LoginForm;

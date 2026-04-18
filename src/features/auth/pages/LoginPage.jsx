import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LoginForm, useAuthStore } from 'features/auth';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, error, clearError } = useAuthStore();

    const handleLogin = async (email, password) => {
        try {
            await login(email, password);
            const user = useAuthStore.getState().user;
            const loginRole = user?.loginRole;
            let targetPath = '/dashboard';

            if (loginRole === 'manager') {
                targetPath = '/dashboard';
            } else if (loginRole === 'employee') {
                targetPath = '/employee-dashboard';
            } else {
                // Fallback case for existing tokens or other roles
                const isAdmin = user?.roles?.some(r => ['Super Admin', 'Admin'].includes(r.name));
                const isEmployee = user?.roles?.some(r => r.name === 'Employee');
                const isIntern = user?.roles?.some(r => r.name === 'Interns');

                if (isAdmin) {
                    targetPath = '/dashboard';
                } else if (isEmployee || isIntern) {
                    targetPath = '/employee-dashboard';
                }
            }

            const from = location.state?.from?.pathname || targetPath;
            navigate(from, { replace: true });
        } catch (err) {
            console.error('[Login] Login failed:', err);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Side - Branding/Image */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-blue-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 opacity-90"></div>
                <img
                    src="/login_background_abstract.png"
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                />
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <h1 className="text-5xl font-bold mb-6">Welcome Back</h1>
                    <p className="text-xl text-blue-100 max-w-md">
                        Manage your company, track productivity, and grow your business with our all-in-one CRM solution.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
                        <p className="mt-2 text-gray-600">
                            Or <Link to="/company-registration" className="font-medium text-blue-600 hover:text-blue-500">register your company</Link>
                        </p>
                    </div>

                    {location.state?.message && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        {location.state.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <LoginForm
                        onSubmit={handleLogin}
                        isLoading={isLoading}
                        error={error}
                        clearError={clearError}
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;


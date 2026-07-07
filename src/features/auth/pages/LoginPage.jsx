import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LoginForm, useAuthStore } from 'features/auth';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { isAdminUser } from '../../../config/roles';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

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
        const isAdmin = isAdminUser(user);
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
    <div className="min-h-screen flex bg-background">
      {/* Brand panel — dark charcoal, desktop only */}
      <div className="hidden lg:flex lg:w-[44%] bg-sidebar flex-col justify-between p-12">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight text-sidebar-foreground">
          Dashflow
        </Link>

        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-sidebar-foreground leading-tight max-w-md">
            Run your company from one quiet place.
          </h1>
          <p className="mt-4 text-sm text-sidebar-muted max-w-sm leading-relaxed">
            People, attendance, payroll, projects and clients — measured,
            organised and out of your way.
          </p>
        </div>

        <p className="text-xs text-sidebar-muted">
          © {new Date().getFullYear()} Dashflow
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link to="/" className="lg:hidden font-display text-lg font-semibold text-foreground tracking-tight">
              Dashflow
            </Link>
            <h2 className="mt-6 lg:mt-0 font-display text-2xl font-semibold text-foreground tracking-tight">
              Sign in
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              New here?{' '}
              <Link to="/company-registration" className="text-primary underline underline-offset-4 hover:no-underline">
                Register your company
              </Link>
            </p>
          </div>

          {location.state?.message && (
            <div className="border border-border bg-muted rounded-md p-3 mb-6">
              <p className="text-sm text-muted-foreground">{location.state.message}</p>
            </div>
          )}

          <div className="bg-card border border-border rounded-lg p-6 sm:p-8 card-shadow">
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
              clearError={clearError}
              onForgotPasswordClick={() => setIsForgotPasswordOpen(true)}
            />
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default Login;


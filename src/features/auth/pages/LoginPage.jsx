import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LoginForm, useAuthStore } from 'features/auth';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { BrandGlyph } from '../../../components/BrandMark';
import { HeroIllustration } from '../../landing/components/LandingIllustrations';
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
        const isAdmin = isAdminUser(user);
        const isEmployee = user?.roles?.some((r) => r.name === 'Employee');
        const isIntern = user?.roles?.some((r) => r.name === 'Interns');

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
    <div className="min-h-screen flex bg-[#f6f5f8]">
      {/* Brand panel */}
      <aside className="hidden lg:flex lg:w-[48%] xl:w-[46%] relative overflow-hidden flex-col bg-[#16122a]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(109,94,252,0.35), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 90%, rgba(109,94,252,0.18), transparent 50%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 flex flex-col h-full px-10 xl:px-14 py-10">
          <Link to="/" className="inline-flex items-center gap-2.5 w-fit">
            <BrandGlyph size={28} />
            <span className="font-display text-lg font-semibold tracking-tight text-white">
              Dashflow
            </span>
          </Link>

          <div className="flex-1 flex flex-col justify-center py-12 max-w-lg">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70 mb-4"
            >
              Workspace
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="font-display text-[2.35rem] xl:text-[2.75rem] leading-[1.08] font-semibold tracking-tight text-white"
            >
              Run your company from one quiet place.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="mt-4 text-[15px] text-white/65 leading-relaxed max-w-md"
            >
              People, attendance, payroll and projects — organised and out of your way.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="mt-10"
            >
              <HeroIllustration className="w-full max-w-md h-auto rounded-2xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]" />
            </motion.div>
          </div>

          <p className="relative z-10 text-xs text-white/40">
            © {new Date().getFullYear()} Dashflow
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex-1 flex flex-col min-h-screen relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 80% 0%, rgba(109,94,252,0.07), transparent 60%)',
          }}
        />

        <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 lg:px-14 pt-6">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2">
            <BrandGlyph size={24} />
            <span className="font-display text-base font-semibold tracking-tight text-foreground">
              Dashflow
            </span>
          </Link>
          <p className="ml-auto text-sm text-muted-foreground">
            New here?{' '}
            <Link
              to="/company-registration"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Create workspace
            </Link>
          </p>
        </div>

        <div className="relative z-10 flex-1 flex items-center px-6 sm:px-10 lg:px-14 xl:px-20 py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[400px]"
          >
            <div className="mb-8">
              <h2 className="font-display text-[1.75rem] font-semibold tracking-tight text-foreground">
                Sign in
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Enter your work email to continue to your workspace.
              </p>
            </div>

            {location.state?.message && (
              <div className="border border-border bg-white/80 rounded-xl p-3 mb-6">
                <p className="text-sm text-muted-foreground">{location.state.message}</p>
              </div>
            )}

            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
              clearError={clearError}
              onForgotPasswordClick={() => setIsForgotPasswordOpen(true)}
            />

            <p className="mt-8 text-xs text-muted-foreground">
              Protected workspace · your data stays private
            </p>
          </motion.div>
        </div>
      </main>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default Login;

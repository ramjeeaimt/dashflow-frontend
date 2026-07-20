import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, CalendarCheck, Wallet, FolderKanban } from 'lucide-react';
import { LoginForm, useAuthStore } from 'features/auth';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { BrandGlyph } from '../../../components/BrandMark';
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

  const highlights = [
    { icon: Users, label: 'People & roles', desc: 'One directory for your whole team' },
    { icon: CalendarCheck, label: 'Attendance', desc: 'Check-in, leaves and WFH in one place' },
    { icon: Wallet, label: 'Payroll', desc: 'Generate and send payslips in a click' },
    { icon: FolderKanban, label: 'Projects', desc: 'Track delivery, clients and time' },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Brand panel — dark charcoal with an animated aurora, desktop only */}
      <div className="hidden lg:flex lg:w-[46%] relative bg-sidebar overflow-hidden flex-col justify-between p-12">
        {/* Aurora blobs */}
        <motion.div
          aria-hidden
          className="absolute -top-24 -left-16 w-96 h-96 rounded-full bg-primary/30 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Subtle grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <BrandGlyph size={30} />
            <span className="font-display text-xl font-semibold tracking-tight text-sidebar-foreground">Dashflow</span>
          </Link>
        </div>

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-[2.6rem] leading-[1.1] font-semibold tracking-tight text-sidebar-foreground max-w-md"
          >
            Run your company from one quiet place.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-4 text-sm text-sidebar-muted max-w-sm leading-relaxed"
          >
            People, attendance, payroll, projects and clients — measured,
            organised and out of your way.
          </motion.p>

          <div className="mt-9 grid grid-cols-2 gap-3 max-w-md">
            {highlights.map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                className="flex items-start gap-3 rounded-lg border border-sidebar-border bg-white/[0.04] p-3 backdrop-blur-sm"
              >
                <span className="w-8 h-8 rounded-md bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <h.icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-sidebar-foreground">{h.label}</p>
                  <p className="text-[11px] text-sidebar-muted leading-snug">{h.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-sidebar-muted">
          © {new Date().getFullYear()} Dashflow
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-6">
              <BrandGlyph size={26} />
              <span className="font-display text-lg font-semibold text-foreground tracking-tight">Dashflow</span>
            </Link>
            <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">
              Welcome back
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

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Protected workspace · your data stays private
          </p>
        </motion.div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default Login;


import React from 'react';
import { motion } from 'framer-motion';

const DOT_COLORS = ['#6d5efc', '#a78bfa', '#c026d3', '#ec4899', '#7c3aed'];

/** Arrow dot — parent row hover drives move + color cycle */
const ReactDot = ({ direction = 'right', delay = 0 }) => {
  const nudge = direction === 'right' ? 6 : -6;
  return (
    <motion.span
      className="mt-0.5 w-6 h-6 rounded-full text-white text-xs flex items-center justify-center shrink-0 shadow-sm shadow-primary/20"
      variants={{
        rest: {
          x: 0,
          y: 0,
          scale: 1,
          backgroundColor: DOT_COLORS[0],
          transition: { duration: 0.25 },
        },
        hover: {
          x: [0, nudge, 0, nudge * 0.7, 0],
          y: [0, -3, 0, -2, 0],
          scale: [1, 1.2, 1.1, 1.18, 1.12],
          backgroundColor: DOT_COLORS,
          transition: {
            delay,
            x: { duration: 0.65, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
            y: { duration: 0.65, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
            scale: { duration: 0.65, repeat: Infinity, repeatType: 'mirror' },
            backgroundColor: { duration: 1.35, repeat: Infinity, ease: 'linear' },
          },
        },
      }}
    >
      {direction === 'right' ? '→' : '←'}
    </motion.span>
  );
};

const FeatureRow = ({ title, text, direction, delay = 0 }) => (
  <motion.div
    className="flex gap-3 cursor-default rounded-lg px-1.5 py-1.5 -mx-1.5 hover:bg-primary/[0.04]"
    initial="rest"
    whileHover="hover"
    animate="rest"
  >
    <ReactDot direction={direction} delay={delay} />
    <div>
      <motion.p
        className="text-sm font-semibold text-foreground"
        variants={{
          rest: { color: '#1c1f2a' },
          hover: { color: '#6d5efc' },
        }}
      >
        {title}
      </motion.p>
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  </motion.div>
);

/** Soft geometric backdrop shapes — HROne-style depth without animation */
export const SoftShapes = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 800 600" fill="none" aria-hidden="true">
    <rect x="520" y="-40" width="360" height="220" rx="24" transform="rotate(28 520 -40)" fill="#6d5efc" fillOpacity="0.08" />
    <rect x="580" y="120" width="280" height="180" rx="20" transform="rotate(28 580 120)" fill="#6d5efc" fillOpacity="0.05" />
    <circle cx="120" cy="480" r="140" fill="#6d5efc" fillOpacity="0.06" />
  </svg>
);

/** Hero: people + floating board — static, clean */
export const HeroIllustration = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 560 420" fill="none" aria-hidden="true">
    <rect width="560" height="420" rx="28" fill="#f4f5f8" />
    {/* desk surface */}
    <rect x="48" y="280" width="464" height="12" rx="6" fill="#e6e8ef" />
    {/* floating product board */}
    <g>
      <rect x="148" y="72" width="264" height="168" rx="16" fill="#fff" stroke="#e6e8ef" strokeWidth="2" />
      <rect x="168" y="96" width="72" height="10" rx="5" fill="#efeaff" />
      <rect x="168" y="120" width="100" height="8" rx="4" fill="#e6e8ef" />
      <rect x="168" y="148" width="48" height="56" rx="10" fill="#efeaff" />
      <rect x="228" y="148" width="48" height="56" rx="10" fill="#dcd6ff" />
      <rect x="288" y="148" width="48" height="56" rx="10" fill="#6d5efc" fillOpacity="0.35" />
      <rect x="348" y="148" width="40" height="56" rx="10" fill="#e6e8ef" />
    </g>
    {/* person left */}
    <circle cx="120" cy="230" r="22" fill="#c4b5fd" />
    <rect x="96" y="254" width="48" height="52" rx="16" fill="#6d5efc" />
    {/* person right */}
    <circle cx="440" cy="236" r="22" fill="#a5b4fc" />
    <rect x="416" y="260" width="48" height="48" rx="16" fill="#4c3fd4" />
    {/* plant */}
    <rect x="500" y="248" width="14" height="36" rx="4" fill="#c4b5fd" />
    <ellipse cx="507" cy="236" rx="18" ry="14" fill="#6d5efc" fillOpacity="0.45" />
    {/* accent dots */}
    <circle cx="72" cy="100" r="6" fill="#6d5efc" fillOpacity="0.4" />
    <circle cx="500" cy="88" r="4" fill="#6d5efc" fillOpacity="0.25" />
  </svg>
);

/** Keka-style modular platform map */
export const ModularMap = ({ className = '' }) => (
  <div className={className}>
    <div className="text-center mb-10">
      <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
        Modular by design. Unified by default.
      </h2>
      <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
        Pick what you need, scale when you are ready. Dashflow grows with your company.
      </p>
    </div>

    <div className="relative max-w-4xl mx-auto">
      {/* Core */}
      <div className="text-center mb-6">
        <p className="text-sm font-semibold text-primary">Core HR</p>
        <p className="text-xs text-muted-foreground">Operations</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-8 relative">
        <div className="hidden sm:block absolute left-1/2 -top-6 w-px h-6 bg-border" />
        {[
          ['Onboarding', 'A clear path from offer letter to first day.'],
          ['Employee records', 'Documents and profiles in one secure place.'],
          ['Time tracking', 'Hours that feel fair, not micromanaged.'],
        ].map(([title, text]) => (
          <div key={title} className="rounded-xl border border-dashed border-border bg-[#faf9f7] px-4 py-4 text-center">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-start">
        <motion.div
          className="rounded-2xl border border-dashed border-border bg-white/80 p-4 space-y-4 transition-colors hover:border-primary/40 hover:bg-white"
          whileHover="panel"
        >
          {[
            ['Payroll', 'Pay on time and stay compliant.'],
            ['Projects', 'Clients, delivery, and boards together.'],
            ['Leave', 'Balances and approvals without spreadsheets.'],
          ].map(([title, text], i) => (
            <FeatureRow key={title} title={title} text={text} direction="right" delay={i * 0.04} />
          ))}
        </motion.div>

        <div className="hidden sm:flex items-center justify-center py-8">
          <motion.div
            className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-display font-bold text-lg shadow-lg shadow-primary/25"
            whileHover={{
              scale: 1.08,
              rotate: [0, -6, 6, 0],
              backgroundColor: DOT_COLORS,
              transition: {
                rotate: { duration: 0.5 },
                backgroundColor: { duration: 1.2, repeat: Infinity, ease: 'linear' },
              },
            }}
          >
            DF
          </motion.div>
        </div>

        <motion.div
          className="rounded-2xl border border-dashed border-border bg-white/80 p-4 space-y-4 transition-colors hover:border-primary/40 hover:bg-white"
          whileHover="panel"
        >
          {[
            ['Attendance', 'Check-in, calendar, and day view.'],
            ['Access', 'Roles so each person sees their work.'],
            ['Notifications', 'Payslips and alerts in one inbox.'],
          ].map(([title, text], i) => (
            <FeatureRow key={title} title={title} text={text} direction="left" delay={i * 0.04} />
          ))}
        </motion.div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-white px-5 py-4 text-center text-xs sm:text-sm text-muted-foreground">
        Roles & permissions · Reports · Web app · Notifications · Mobile-ready
      </div>
    </div>
  </div>
);

/** Orbit / network mark for dark CTA — HROne style, static */
export const OrbitIllustration = ({ className = '' }) => {
  const nodes = [
    { x: 200, y: 40, label: 'People' },
    { x: 320, y: 90, label: 'Payroll' },
    { x: 340, y: 200, label: 'Projects' },
    { x: 280, y: 300, label: 'Leave' },
    { x: 120, y: 300, label: 'Finance' },
    { x: 40, y: 200, label: 'Tasks' },
    { x: 60, y: 90, label: 'Access' },
  ];
  return (
    <svg className={className} viewBox="0 0 400 360" fill="none" aria-hidden="true">
      <circle cx="200" cy="180" r="120" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="6 8" />
      <circle cx="200" cy="180" r="80" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 6" />
      <circle cx="200" cy="180" r="40" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      {nodes.map((n) => (
        <g key={n.label}>
          <line x1="200" y1="180" x2={n.x} y2={n.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <circle cx={n.x} cy={n.y} r="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="Inter, sans-serif">{n.label}</text>
        </g>
      ))}
      <rect x="172" y="152" width="56" height="56" rx="16" fill="#6d5efc" />
      <rect x="184" y="164" width="14" height="14" rx="3" fill="#fff" />
      <rect x="202" y="164" width="14" height="8" rx="3" fill="#fff" fillOpacity="0.7" />
      <rect x="184" y="182" width="20" height="14" rx="3" fill="#fff" fillOpacity="0.9" />
      <rect x="208" y="182" width="8" height="14" rx="3" fill="#fff" />
    </svg>
  );
};

/** Simple step icon cards */
export const StepGlyph = ({ step, className = '' }) => {
  const icons = {
    '01': (
      <g>
        <rect x="20" y="28" width="88" height="64" rx="12" fill="#efeaff" />
        <rect x="36" y="44" width="40" height="8" rx="4" fill="#6d5efc" />
        <rect x="36" y="60" width="56" height="6" rx="3" fill="#c4b5fd" />
        <circle cx="96" cy="36" r="10" fill="#6d5efc" />
      </g>
    ),
    '02': (
      <g>
        <circle cx="40" cy="48" r="14" fill="#c4b5fd" />
        <circle cx="64" cy="48" r="14" fill="#a5b4fc" />
        <circle cx="88" cy="48" r="14" fill="#6d5efc" />
        <rect x="28" y="72" width="72" height="8" rx="4" fill="#e6e8ef" />
      </g>
    ),
    '03': (
      <g>
        <rect x="24" y="32" width="80" height="56" rx="10" fill="#efeaff" stroke="#6d5efc" strokeWidth="2" />
        <rect x="36" y="48" width="24" height="24" rx="6" fill="#6d5efc" fillOpacity="0.35" />
        <rect x="68" y="48" width="24" height="24" rx="6" fill="#6d5efc" />
      </g>
    ),
  };
  return (
    <svg className={className} viewBox="0 0 128 120" fill="none" aria-hidden="true">
      {icons[step] || icons['01']}
    </svg>
  );
};

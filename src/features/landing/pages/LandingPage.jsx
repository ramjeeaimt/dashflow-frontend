import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle, Users, Shield, Menu, X,
  Clock, Briefcase, Calendar, Wallet,
  LayoutDashboard, ChevronDown,
} from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import BrandMark from '../../../components/BrandMark';
import {
  SoftShapes,
  HeroIllustration,
  ModularMap,
  OrbitIllustration,
  StepGlyph,
} from '../components/LandingIllustrations';
import ShineCard from '../components/ShineCard';
import { useSoftScroll, softScrollTo } from '../hooks/useSoftScroll';

const NAV = [
  { label: 'Product', href: '#product' },
  { label: 'How it works', href: '#how' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Privacy', to: '/privacy-policy' },
];

const MODULES = [
  { icon: Users, title: 'People', text: 'Directory, roles, and employee records in one place.' },
  { icon: Clock, title: 'Attendance', text: 'Check-in, timelines, and a calendar managers can trust.' },
  { icon: Calendar, title: 'Leave', text: 'Requests, balances, and approvals without a spreadsheet.' },
  { icon: Wallet, title: 'Payroll', text: 'Monthly pay runs and payslips beside finance.' },
  { icon: Briefcase, title: 'Projects', text: 'Clients, delivery, and a board for work in flight.' },
  { icon: Shield, title: 'Access', text: 'Roles so each person only sees their work.' },
];

const STEPS = [
  { n: '01', title: 'Register the company', text: 'Name the workspace and set country defaults.' },
  { n: '02', title: 'Invite your people', text: 'Add the admin, then bring the team in.' },
  { n: '03', title: 'Run the week here', text: 'Attendance, leave, payroll, and tasks stay together.' },
];

const PLANS = [
  {
    name: 'Basic',
    price: '₹1,999',
    note: 'per month, billed annually',
    text: 'For a small team getting the basics in order.',
    points: ['Up to 10 employees', 'Project tracking', 'Client records', 'Email support'],
    cta: 'Start free trial',
    to: '/company-registration',
  },
  {
    name: 'Business',
    price: '₹4,999',
    note: 'per month, billed annually',
    text: 'For companies running payroll and permissions together.',
    points: ['Unlimited employees', 'Payroll and expenses', 'Roles and permissions', 'Priority support'],
    cta: 'Go Business',
    to: '/company-registration',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    note: 'shaped around your setup',
    text: 'For teams that need a dedicated setup.',
    points: ['Dedicated database', 'Custom API access', 'Account manager'],
    cta: 'See full pricing',
    to: '/pricing',
  },
];

const FAQS = [
  {
    q: 'What is Dashflow?',
    a: 'Dashflow is one workspace for people, attendance, leave, payroll, and projects — so HR and delivery do not live in five tools.',
  },
  {
    q: 'How fast is setup?',
    a: 'Quick setup asks one or two questions at a time. Optional steps can be skipped and finished later in Company settings.',
  },
  {
    q: 'Can I skip logo and address?',
    a: 'Yes. Only company name, industry, size, country, and your admin account are required to open a workspace.',
  },
  {
    q: 'Is payroll included?',
    a: 'Payroll sits next to attendance and leave on Business and above. Payslips go out from the same people records.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const ProductFrame = () => (
  <div className="rounded-2xl border border-border bg-[#12141c] p-2 shadow-[0_24px_60px_rgba(28,31,42,0.2)]">
    <div className="rounded-xl bg-card overflow-hidden border border-border">
      <div className="flex items-center gap-2 h-9 px-3 border-b border-border bg-muted/50">
        <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
        <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
        <span className="w-2 h-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[10px] text-muted-foreground">dashflow.app / home</span>
      </div>
      <div className="grid grid-cols-[100px_1fr] min-h-[200px]">
        <aside className="border-r border-border p-2 space-y-0.5 bg-white">
          {[['Home', true], ['People', false], ['Payroll', false], ['Tasks', false]].map(([label, active]) => (
            <div
              key={label}
              className={`px-2 py-1.5 rounded-md text-[10px] font-medium ${active ? 'bg-accent text-primary' : 'text-muted-foreground'}`}
            >
              {label}
            </div>
          ))}
        </aside>
        <div className="p-3 bg-[#f4f5f8] space-y-2">
          <div className="grid grid-cols-3 gap-1.5">
            {[['Present', '42'], ['On leave', '3'], ['Tasks', '18']].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white border border-border px-2 py-2">
                <p className="text-[9px] text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-white border border-border divide-y divide-border">
            {[['Payroll review', 'Due today'], ['Leave request', 'Waiting']].map(([title, status]) => (
              <div key={title} className="flex items-center justify-between px-2.5 py-2">
                <p className="text-[11px] font-medium">{title}</p>
                <span className="text-[9px] text-primary bg-accent px-1.5 py-0.5 rounded-full">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LandingPage = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useSoftScroll();

  const go = (href) => {
    setMobileOpen(false);
    softScrollTo(href);
  };

  return (
    <div className="min-h-screen bg-white text-foreground">
      <div className="bg-[#1b1533] text-white">
        <p className="max-w-6xl mx-auto px-4 py-2 text-center text-xs sm:text-sm">
          People, attendance, payroll, and projects in one workspace.{' '}
          <Link to="/features" className="underline underline-offset-4 text-white/80 hover:text-white">See the product</Link>
        </p>
      </div>

      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" aria-label="Dashflow home"><BrandMark /></Link>
          <div className="hidden md:flex items-center gap-1">
            {NAV.map((item) => item.to ? (
              <Link key={item.label} to={item.to} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted">{item.label}</Link>
            ) : (
              <button key={item.label} onClick={() => go(item.href)} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted">{item.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hidden sm:inline text-sm font-medium px-3 py-2 rounded-lg hover:bg-muted">Dashboard</Link>
                <button onClick={() => { logout(); navigate('/login'); }} className="text-sm px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted">Log in</Link>
                <Link to="/company-registration" className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90">
                  Start free trial <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
            <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-1">
            {NAV.map((item) => item.to ? (
              <Link key={item.label} to={item.to} onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm hover:bg-muted">{item.label}</Link>
            ) : (
              <button key={item.label} onClick={() => go(item.href)} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-muted">{item.label}</button>
            ))}
            {!isAuthenticated && (
              <Link to="/company-registration" className="block text-center mt-2 px-3 py-2.5 rounded-lg bg-primary text-white text-sm font-medium">Start free trial</Link>
            )}
          </div>
        )}
      </nav>

      <header className="relative overflow-hidden border-b border-border">
        <SoftShapes className="absolute right-0 top-0 w-[55%] h-full pointer-events-none hidden lg:block" />
        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-20 lg:pt-20 lg:pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-accent px-2.5 py-1 rounded-full">
              <LayoutDashboard className="w-3.5 h-3.5" /> HR and work, one workspace
            </motion.p>
            <motion.h1 variants={fadeUp} className="mt-5 font-display text-4xl sm:text-5xl leading-[1.08] font-semibold tracking-tight">
              Run the company from the same place the team already works.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Dashflow keeps people, attendance, leave, payroll, and projects together — so Monday does not start in five tools.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/company-registration" className="inline-flex items-center justify-center gap-2 h-12 px-5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90">
                Start free trial <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={() => go('#product')} className="inline-flex items-center justify-center gap-2 h-12 px-5 bg-white border border-border font-medium rounded-xl hover:bg-muted">
                Look through the product
              </button>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {['Quick setup', 'Skip optional steps', 'Role-based access'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-primary" />{t}</span>
              ))}
            </motion.div>
          </motion.div>
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroIllustration className="w-full rounded-[28px] border border-border shadow-sm" />
            <div className="hidden sm:block absolute -bottom-8 -left-4 w-[78%] z-10">
              <ProductFrame />
            </div>
          </motion.div>
        </div>
      </header>

      <section id="product" className="bg-[#faf9f7] border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <ModularMap />
          <motion.div
            className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            {MODULES.map(({ icon: Icon, title, text }) => (
              <motion.div key={title} variants={fadeUp}>
                <div className="h-full rounded-2xl border border-border bg-white p-5">
                  <div className="w-10 h-10 rounded-xl bg-accent text-primary flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">How it works</p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight">Three steps, then the team is inside.</h2>
        <motion.div
          className="mt-10 grid md:grid-cols-3 gap-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          {STEPS.map((s) => (
            <motion.div key={s.n} variants={fadeUp}>
              <ShineCard pixels className="h-full rounded-2xl bg-[#faf9f7] border border-border p-6">
                <StepGlyph step={s.n} className="h-24 w-auto mb-2" />
                <span className="text-sm font-semibold text-primary">{s.n}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </ShineCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="bg-[#1b1533] text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide bg-white/10 px-3 py-1 rounded-full mb-4">
              Rated for growing teams
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Join companies running HR <span className="text-[#a78bfa]">in one place.</span>
            </h2>
            <p className="mt-4 text-white/70 text-sm leading-relaxed max-w-md">
              From first check-in to month-end pay — without switching products.
            </p>
            <Link to="/company-registration" className="mt-8 inline-flex items-center gap-2 h-11 px-5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90">
              Book a free trial <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/60">
              {['No credit card', 'Skip optional steps', 'Setup in minutes'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" />{t}</span>
              ))}
            </div>
          </div>
          <OrbitIllustration className="w-full max-w-md mx-auto" />
        </div>
      </section>

      <section id="pricing" className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pricing</p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight">Clear plans. The same product.</h2>
        <motion.div
          className="mt-10 grid md:grid-cols-3 gap-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
        >
          {PLANS.map((plan) => (
            <motion.div key={plan.name} variants={fadeUp}>
              <div
                className={`h-full rounded-2xl p-6 flex flex-col ${
                  plan.popular
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border'
                }`}
              >
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="mt-4 font-display text-4xl font-semibold tracking-tight">{plan.price}</p>
                <p className={`text-xs mt-1 ${plan.popular ? 'text-white/70' : 'text-muted-foreground'}`}>{plan.note}</p>
                <p className={`mt-4 text-sm ${plan.popular ? 'text-white/80' : 'text-muted-foreground'}`}>{plan.text}</p>
                <ul className="mt-5 space-y-2 flex-1">
                  {plan.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? 'text-white' : 'text-primary'}`} />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.to}
                  className={`mt-6 inline-flex items-center justify-center h-11 rounded-xl text-sm font-medium ${plan.popular ? 'bg-white text-primary' : 'bg-foreground text-white'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="border-t border-border bg-[#faf9f7]">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">FAQ</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight mb-8">Frequently asked questions</h2>
          <div className="divide-y divide-border border-y border-border">
            {FAQS.map((item, i) => (
              <button
                key={item.q}
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="w-full text-left py-5 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-foreground">{item.q}</p>
                  {openFaq === i && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.a}</p>}
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2">
            <BrandMark />
            <p className="mt-3 text-sm text-muted-foreground max-w-sm">People, attendance, payroll, and projects for teams that want one workspace.</p>
          </div>
          <div>
            <p className="text-sm font-semibold mb-3">Product</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
              <li><Link to="/company-registration" className="hover:text-foreground">Quick setup</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold mb-3">Company</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/login" className="hover:text-foreground">Log in</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-foreground">Privacy policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <p className="max-w-6xl mx-auto px-4 py-4 text-xs text-muted-foreground">© {new Date().getFullYear()} Dashflow</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

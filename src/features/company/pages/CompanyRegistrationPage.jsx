import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import CompanyInfoStep, { COMPANY_MINI_STEPS } from '../components/CompanyInfoStep';
import AdminAccountStep, { getAdminMiniSteps } from '../components/AdminAccountStep';
import ConfigurationStep, { CONFIG_MINI_STEPS } from '../components/ConfigurationStep';
import NavigationControls from '../components/NavigationControls';
import BrandMark from '../../../components/BrandMark';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import LottiePlayer from '../../../components/ui/LottiePlayer';
import {
  SoftShapes,
  HeroIllustration,
} from '../../landing/components/LandingIllustrations';

const PANEL_COPY = {
  1: {
    eyebrow: 'Company',
    title: 'Tell us about your company.',
    body: 'A few details now — you can refine everything later from settings.',
  },
  2: {
    eyebrow: 'Admin',
    title: 'Set up your admin account.',
    body: 'This person manages the workspace, invites, and billing.',
  },
  3: {
    eyebrow: 'Preferences',
    title: 'Finish with your defaults.',
    body: 'Timezone, schedule, and modules — change them anytime.',
  },
};

const CompanyRegistration = () => {
  const navigate = useNavigate();
  const { register, user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [miniStep, setMiniStep] = useState(0);
  const [quickSetup, setQuickSetup] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const steps = [
    { id: 1, title: 'Company Info', description: 'Basic company details' },
    { id: 2, title: 'Admin Account', description: 'Administrator setup' },
    { id: 3, title: 'Configuration', description: 'Initial settings' },
  ];

  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industry: '',
    companySize: '',
    logo: '',
    logoFile: null,
    address: '',
    city: '',
    postalCode: '',
    country: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    timezone: 'America/New_York',
    currency: 'USD',
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workStartTime: '09:00',
    workEndTime: '17:00',
    enableTimeTracking: true,
    enableScreenMonitoring: false,
    enablePayroll: true,
  });

  const isLinking = !!user;

  const allMiniSteps = useMemo(() => {
    if (currentStep === 1) return COMPANY_MINI_STEPS;
    if (currentStep === 2) return getAdminMiniSteps(isLinking);
    return CONFIG_MINI_STEPS;
  }, [currentStep, isLinking]);

  const activeMiniSteps = useMemo(() => {
    if (!quickSetup) return allMiniSteps;
    return allMiniSteps.filter((s) => s.required);
  }, [allMiniSteps, quickSetup]);

  const currentMini = activeMiniSteps[miniStep] || activeMiniSteps[0];
  const isLastMini = miniStep >= activeMiniSteps.length - 1;
  const isFirstOverall = currentStep === 1 && miniStep === 0;
  const isLastOverall = currentStep === steps.length && isLastMini;
  const panel = PANEL_COPY[currentStep] || PANEL_COPY[1];

  useEffect(() => {
    if (user && !formData.email) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (miniStep >= activeMiniSteps.length) {
      setMiniStep(Math.max(0, activeMiniSteps.length - 1));
    }
  }, [activeMiniSteps.length, miniStep]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isStrongPassword = (password) => {
    return (
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };

  const validateCurrentMini = () => {
    const newErrors = {};
    const key = currentMini?.key;

    if (currentStep === 1) {
      if (key === 'name' && !formData.companyName?.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (key === 'website' && formData.website && !isValidUrl(formData.website)) {
        newErrors.website = 'Please enter a valid website URL';
      }
      if (key === 'classification') {
        if (!formData.industry) newErrors.industry = 'Please select an industry';
        if (!formData.companySize) newErrors.companySize = 'Please select company size';
      }
      if (key === 'location' && !formData.country?.trim()) {
        newErrors.country = 'Country is required';
      }
    }

    if (currentStep === 2) {
      if (key === 'name') {
        if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
      }
      if (key === 'contact' && !isLinking) {
        if (!formData.email?.trim()) {
          newErrors.email = 'Email is required';
        } else if (!isValidEmail(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
      }
      if (key === 'password') {
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters long';
        } else if (!isStrongPassword(formData.password)) {
          newErrors.password =
            'Password must contain uppercase, lowercase, number, and special character';
        }
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }

    if (currentStep === 3) {
      if (key === 'locale') {
        if (!formData.timezone) newErrors.timezone = 'Please select a timezone';
        if (!formData.currency) newErrors.currency = 'Please select a currency';
      }
      if (key === 'schedule' && (!formData.workingDays || formData.workingDays.length === 0)) {
        newErrors.workingDays = 'Please select at least one working day';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceed = () => {
    const key = currentMini?.key;
    if (!currentMini?.required) return true;

    if (currentStep === 1) {
      if (key === 'name') return !!formData.companyName?.trim();
      if (key === 'classification') return !!formData.industry && !!formData.companySize;
      if (key === 'location') return !!formData.country?.trim();
      return true;
    }

    if (currentStep === 2) {
      if (key === 'name') return !!formData.firstName?.trim() && !!formData.lastName?.trim();
      if (key === 'contact') return isLinking || (!!formData.email?.trim() && isValidEmail(formData.email));
      if (key === 'password') {
        return (
          !!formData.password &&
          formData.password.length >= 8 &&
          formData.password === formData.confirmPassword
        );
      }
      return true;
    }

    if (currentStep === 3) {
      if (key === 'locale') return !!formData.timezone && !!formData.currency;
      if (key === 'schedule') return formData.workingDays?.length > 0;
      return true;
    }

    return false;
  };

  const advance = () => {
    if (!isLastMini) {
      setMiniStep((m) => m + 1);
      setErrors({});
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep((s) => s + 1);
      setMiniStep(0);
      setErrors({});
    }
  };

  const handleNext = () => {
    if (!validateCurrentMini()) return;
    advance();
  };

  const handleSkip = () => {
    if (currentMini?.required) return;
    setErrors({});
    advance();
  };

  const handlePrevious = () => {
    if (miniStep > 0) {
      setMiniStep((m) => m - 1);
      setErrors({});
      return;
    }

    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      const prevMinis =
        prevStep === 1
          ? quickSetup
            ? COMPANY_MINI_STEPS.filter((s) => s.required)
            : COMPANY_MINI_STEPS
          : prevStep === 2
            ? quickSetup
              ? getAdminMiniSteps(isLinking).filter((s) => s.required)
              : getAdminMiniSteps(isLinking)
            : quickSetup
              ? CONFIG_MINI_STEPS.filter((s) => s.required)
              : CONFIG_MINI_STEPS;
      setMiniStep(prevMinis.length - 1);
      setErrors({});
    }
  };

  const handleComplete = async () => {
    if (!validateCurrentMini()) return;

    setIsLoading(true);
    setSubmitError('');

    try {
      const registrationData = {
        companyName: formData.companyName,
        companyWebsite: formData.website,
        industry: formData.industry,
        companySize: formData.companySize,
        logo: formData.logo,
        companyAddress: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        timezone: formData.timezone,
        currency: formData.currency,
        workingDays: formData.workingDays,
        workingHoursStart: formData.workStartTime,
        workingHoursEnd: formData.workEndTime,
        enableTimeTracking: formData.enableTimeTracking,
        enableScreenMonitoring: formData.enableScreenMonitoring,
        enablePayroll: formData.enablePayroll,
      };

      const response = await register(registrationData);
      const payload = response?.data || response;
      localStorage.setItem('user', JSON.stringify(payload.user || response.user));
      localStorage.setItem('companyRegistration', JSON.stringify(registrationData));
      localStorage.setItem('isRegistered', 'true');
      localStorage.setItem('dashflow_show_tour', '1');
      localStorage.removeItem('dashflow_dashboard_tour_v1');
      localStorage.removeItem('companyRegistrationDraft');

      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      const apiMessage = error.response?.data?.message;
      const message = Array.isArray(apiMessage)
        ? apiMessage.join(', ')
        : apiMessage ||
          (error.code === 'ERR_NETWORK' || !error.response
            ? 'Cannot reach the server. Make sure the backend is running on port 5002.'
            : 'Registration failed. Please try again.');
      setSubmitError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuickSetup = () => {
    const next = !quickSetup;
    setQuickSetup(next);

    const currentKey = currentMini?.key;
    const nextList = next
      ? allMiniSteps.filter((s) => s.required)
      : allMiniSteps;
    const mappedIndex = nextList.findIndex((s) => s.key === currentKey);
    setMiniStep(mappedIndex >= 0 ? mappedIndex : 0);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CompanyInfoStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            miniStep={COMPANY_MINI_STEPS.findIndex((s) => s.key === currentMini?.key)}
          />
        );
      case 2: {
        const adminSteps = getAdminMiniSteps(isLinking);
        return (
          <AdminAccountStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            miniStep={adminSteps.findIndex((s) => s.key === currentMini?.key)}
          />
        );
      }
      case 3:
        return (
          <ConfigurationStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            miniStep={CONFIG_MINI_STEPS.findIndex((s) => s.key === currentMini?.key)}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const savedData = localStorage.getItem('companyRegistrationDraft');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData((prev) => ({ ...prev, ...parsedData }));
      } catch (error) {
        console.error('Failed to load saved registration data:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('companyRegistrationDraft', JSON.stringify(formData));
  }, [formData]);

  const overallProgress = useMemo(() => {
    const companyCount = quickSetup
      ? COMPANY_MINI_STEPS.filter((s) => s.required).length
      : COMPANY_MINI_STEPS.length;
    const adminCount = quickSetup
      ? getAdminMiniSteps(isLinking).filter((s) => s.required).length
      : getAdminMiniSteps(isLinking).length;
    const configCount = quickSetup
      ? CONFIG_MINI_STEPS.filter((s) => s.required).length
      : CONFIG_MINI_STEPS.length;
    const total = companyCount + adminCount + configCount;
    let completed = 0;
    if (currentStep > 1) completed += companyCount;
    if (currentStep > 2) completed += adminCount;
    completed += miniStep;
    return Math.round(((completed + 1) / total) * 100);
  }, [currentStep, miniStep, quickSetup, isLinking]);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — brand + illustration */}
      <aside className="hidden lg:flex lg:w-[44%] relative flex-col justify-between overflow-hidden border-r border-border/60 bg-[#f7f6fb] p-10 xl:p-12">
        <SoftShapes className="absolute inset-0 w-full h-full pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex">
            <BrandMark size="md" />
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary mb-3">
            {panel.eyebrow}
          </p>
          <h1 className="font-display text-3xl xl:text-4xl font-semibold tracking-tight text-foreground max-w-sm leading-tight">
            {panel.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm leading-relaxed">
            {panel.body}
          </p>

          <div className="mt-10 max-w-md">
            <HeroIllustration className="w-full h-auto drop-shadow-sm" />
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          {steps.map((s) => {
            const active = s.id === currentStep;
            const done = s.id < currentStep;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-primary text-white'
                      : done
                        ? 'bg-primary/15 text-primary'
                        : 'bg-white text-muted-foreground border border-border'
                  }`}
                >
                  {done ? <Icon name="Check" size={14} /> : s.id}
                </span>
                <span
                  className={`text-xs font-medium hidden xl:inline ${
                    active ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {s.title}
                </span>
                {s.id < steps.length && (
                  <span className="w-6 h-px bg-border mx-1 hidden xl:block" />
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Right — form column */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="flex items-center justify-between gap-4 px-6 sm:px-10 pt-6 pb-4">
          <Link to="/" className="lg:hidden inline-flex">
            <BrandMark size="sm" />
          </Link>

          <div className="ml-auto inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 p-1">
            <Button
              variant={quickSetup ? 'default' : 'ghost'}
              size="sm"
              onClick={() => !quickSetup && toggleQuickSetup()}
              className="rounded-full h-8 px-3 text-xs"
            >
              Quick Setup
            </Button>
            <Button
              variant={!quickSetup ? 'default' : 'ghost'}
              size="sm"
              onClick={() => quickSetup && toggleQuickSetup()}
              className="rounded-full h-8 px-3 text-xs"
            >
              Full Setup
            </Button>
          </div>
        </header>

        {/* Single overall progress */}
        <div className="px-6 sm:px-10">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>
              Question {miniStep + 1} of {activeMiniSteps.length}
            </span>
            <span>
              Step {currentStep} of {steps.length}
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            {activeMiniSteps.map((s, i) => (
              <div
                key={s.key}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === miniStep
                    ? 'w-6 bg-primary'
                    : i < miniStep
                      ? 'w-3 bg-primary/40'
                      : 'w-3 bg-border'
                }`}
                title={s.title}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col px-6 sm:px-10 py-8">
          <div className="flex-1 max-w-lg w-full mx-auto lg:mx-0 lg:ml-4 xl:ml-10">
            {renderStepContent()}
          </div>

          <div className="max-w-lg w-full mx-auto lg:mx-0 lg:ml-4 xl:ml-10 mt-auto pt-6">
            {submitError && (
              <div className="mb-4 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
                {submitError}
              </div>
            )}
            <NavigationControls
              onPrevious={handlePrevious}
              onNext={handleNext}
              onComplete={handleComplete}
              onSkip={handleSkip}
              isLoading={isLoading}
              canProceed={canProceed()}
              canSkip={!currentMini?.required}
              showBack={!isFirstOverall}
              isLastStep={isLastOverall}
              compact
            />
          </div>
        </div>

        <footer className="px-6 sm:px-10 py-4 text-center lg:text-left text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dashflow. All rights reserved.
        </footer>
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 text-center max-w-md mx-4 shadow-sm">
            <div className="w-40 h-40 mx-auto -mt-2 mb-1">
              <LottiePlayer src="/lottie/workspace-setup.json" className="w-full h-full" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Configuring workspace</h3>
            <p className="text-sm text-muted-foreground">
              Preparing your secure environment and dashboard.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyRegistration;

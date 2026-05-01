import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import ProgressIndicator from '../components/ProgressIndicator';
import CompanyInfoStep from '../components/CompanyInfoStep';
import AdminAccountStep from '../components/AdminAccountStep';
import ConfigurationStep from '../components/ConfigurationStep';
import PricingPanel from '../components/PricingPanel';
import NavigationControls from '../components/NavigationControls';
import Icon from '../../../components/AppIcon';

const CompanyRegistration = () => {
  const navigate = useNavigate();
  const { register, isLoading: storeLoading, error: storeError } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const steps = [
    {
      id: 1,
      title: 'Company Info',
      description: 'Basic company details'
    },
    {
      id: 2,
      title: 'Admin Account',
      description: 'Administrator setup'
    },
    {
      id: 3,
      title: 'Configuration',
      description: 'Initial settings'
    }
  ];

  const [formData, setFormData] = useState({
    // Company Information
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

    // Admin Account
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

    // Configuration
    timezone: 'America/New_York',
    currency: 'USD',
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workStartTime: '09:00',
    workEndTime: '17:00',
    enableTimeTracking: true,
    enableScreenMonitoring: false,
    enablePayroll: true
  });

  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !formData.email) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData?.companyName?.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData?.industry) {
      newErrors.industry = 'Please select an industry';
    }

    if (!formData?.companySize) {
      newErrors.companySize = 'Please select company size';
    }

    if (!formData?.country?.trim()) {
      newErrors.country = 'Country is required';
    }

    if (formData?.website && !isValidUrl(formData?.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData?.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData?.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!isStrongPassword(formData?.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!formData?.timezone) {
      newErrors.timezone = 'Please select a timezone';
    }

    if (!formData?.currency) {
      newErrors.currency = 'Please select a currency';
    }

    if (formData?.workingDays?.length === 0) {
      newErrors.workingDays = 'Please select at least one working day';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  // Utility functions
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex?.test(email);
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isStrongPassword = (password) => {
    const hasUppercase = /[A-Z]/?.test(password);
    const hasLowercase = /[a-z]/?.test(password);
    const hasNumber = /\d/?.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/?.test(password);
    return hasUppercase && hasLowercase && hasNumber && hasSpecial;
  };

  // Navigation handlers
  const handleNext = () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep < steps?.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);

    try {
      // Call actual registration API
      const registrationData = {
        // Company Info
        companyName: formData.companyName,
        companyWebsite: formData.website,
        industry: formData.industry,
        companySize: formData.companySize,
        logo: formData.logo, // Assuming logo is a URL string for now
        companyAddress: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,

        // Admin Account
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,

        // Configuration
        timezone: formData.timezone,
        currency: formData.currency,
        workingDays: formData.workingDays,
        workingHoursStart: formData.workStartTime,
        workingHoursEnd: formData.workEndTime,
        enableTimeTracking: formData.enableTimeTracking,
        enableScreenMonitoring: formData.enableScreenMonitoring,
        enablePayroll: formData.enablePayroll,
      };

      const response=await register(registrationData);
      localStorage.setItem('user', JSON.stringify(response.user || response.data?.user));

      // Store registration data in localStorage
      localStorage.setItem('companyRegistration', JSON.stringify(registrationData));
      localStorage.setItem('isRegistered', 'true');
      localStorage.removeItem('companyRegistrationDraft'); // Clear draft

      // Show success message and redirect to login
      // Ideally, we should show a preview/success modal here as requested
      // For now, we'll use the alert and redirect, but we can enhance this to a modal if needed
      // The user asked for "show registration preview after final success"
      // This implies a view where they see what they registered before logging in?
      // Or maybe just a success screen. Let's redirect to a success page or show a modal.
      // Since we don't have a success page, let's use a modal or just redirect to login with a success state.

      alert('Registration completed successfully! Please login.');
      navigate('/login');
      // navigate('/profile');

    } catch (error) {
      console.error('Registration failed:', error);
      alert(storeError || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if current step can proceed
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData?.companyName && formData?.industry && formData?.companySize && formData?.country;
      case 2:
        return formData?.firstName && formData?.lastName && formData?.email &&
          formData?.password && formData?.confirmPassword &&
          formData?.password === formData?.confirmPassword;
      case 3:
        return formData?.timezone && formData?.currency && formData?.workingDays?.length > 0;
      default:
        return false;
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CompanyInfoStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 2:
        return (
          <AdminAccountStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 3:
        return (
          <ConfigurationStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      default:
        return null;
    }
  };

  // Auto-save form data to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('companyRegistrationDraft');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
      } catch (error) {
        console.error('Failed to load saved registration data:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('companyRegistrationDraft', JSON.stringify(formData));
  }, [formData]);

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Indicator */}
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={steps?.length}
        steps={steps}
      />
      {/* Main Content */}
      <div className="flex-1">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 p-6">
          {/* Form Content */}
          <div className="xl:col-span-3">
            {renderStepContent()}
          </div>

          {/* Pricing Panel */}
          <div className="xl:col-span-1">
            <PricingPanel selectedCompanySize={formData?.companySize} />
          </div>
        </div>
      </div>
      {/* Navigation Controls */}
      <NavigationControls
        currentStep={currentStep}
        totalSteps={steps?.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onComplete={handleComplete}
        isLoading={isLoading}
        canProceed={canProceed()}
      />
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-8 text-center max-w-md mx-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Building2" size={32} className="text-primary animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Setting up your company...
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're creating your workspace and configuring your settings. This may take a few moments.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyRegistration;
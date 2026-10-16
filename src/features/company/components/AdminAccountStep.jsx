import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import useAuthStore from '../../../store/useAuthStore';

export const getAdminMiniSteps = (isLinking) => {
  const steps = [
    {
      key: 'name',
      title: 'What is your name?',
      description: 'This will be the primary administrator for your workspace.',
      required: true,
      fields: ['firstName', 'lastName'],
    },
    {
      key: 'contact',
      title: 'How can we reach you?',
      description: 'Email is required for login. Phone is optional.',
      required: true,
      fields: ['email', 'phone'],
    },
  ];

  if (!isLinking) {
    steps.push({
      key: 'password',
      title: 'Create a secure password',
      description: 'Use at least 8 characters with uppercase, lowercase, number, and symbol.',
      required: true,
      fields: ['password', 'confirmPassword'],
    });
  }

  return steps;
};

const AdminAccountStep = ({ formData, setFormData, errors, setErrors, miniStep = 0 }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { user: authenticatedUser } = useAuthStore();
  const isLinking = !!authenticatedUser;
  const miniSteps = getAdminMiniSteps(isLinking);
  const step = miniSteps[miniStep] || miniSteps[0];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    if (field === 'confirmPassword' || (field === 'password' && formData?.confirmPassword)) {
      const password = field === 'password' ? value : formData?.password;
      const confirmPassword = field === 'confirmPassword' ? value : formData?.confirmPassword;

      if (confirmPassword && password !== confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };

    const checks = {
      length: password?.length >= 8,
      lowercase: /[a-z]/?.test(password),
      uppercase: /[A-Z]/?.test(password),
      number: /\d/?.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/?.test(password)
    };

    const score = Object.values(checks)?.filter(Boolean)?.length;

    if (score < 2) return { strength: 1, label: 'Weak', color: 'bg-error' };
    if (score < 4) return { strength: 2, label: 'Fair', color: 'bg-warning' };
    if (score < 5) return { strength: 3, label: 'Good', color: 'bg-primary' };
    return { strength: 4, label: 'Strong', color: 'bg-success' };
  };

  const passwordStrength = getPasswordStrength(formData?.password);

  const renderFields = () => {
    switch (step.key) {
      case 'name':
        return (
          <div className="space-y-6">
            <Input
              label="First Name"
              type="text"
              placeholder="Enter your first name"
              value={formData?.firstName}
              onChange={(e) => handleInputChange('firstName', e?.target?.value)}
              error={errors?.firstName}
              required
              autoFocus
            />
            <Input
              label="Last Name"
              type="text"
              placeholder="Enter your last name"
              value={formData?.lastName}
              onChange={(e) => handleInputChange('lastName', e?.target?.value)}
              error={errors?.lastName}
              required
            />
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            {isLinking ? (
              <div className="bg-primary/10 border border-border rounded-lg p-6 space-y-3">
                <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center text-primary shadow-sm border border-border">
                  <Icon name="Link" size={24} />
                </div>
                <h3 className="text-lg font-bold text-foreground">Account linked</h3>
                <p className="text-sm text-muted-foreground">
                  You're signed in as <strong>{authenticatedUser.email}</strong>.
                  This workspace will be connected to your existing profile.
                </p>
              </div>
            ) : (
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@yourcompany.com"
                value={formData?.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                error={errors?.email}
                required
                description="Used for secure authentication and primary communication"
                autoFocus
              />
            )}
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData?.phone}
              onChange={(e) => handleInputChange('phone', e?.target?.value)}
              error={errors?.phone}
              description="Optional — for account recovery and alerts"
            />
          </div>
        );

      case 'password':
        return (
          <div className="space-y-6">
            <div className="relative">
              <Input
                label="Security Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a robust password"
                value={formData?.password}
                onChange={(e) => handleInputChange('password', e?.target?.value)}
                error={errors?.password}
                required
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
              </Button>
            </div>

            {formData?.password && (
              <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Security Rating</span>
                  <span className={`text-sm font-bold uppercase tracking-wider ${
                    passwordStrength?.strength === 1 ? 'text-error' :
                    passwordStrength?.strength === 2 ? 'text-warning' :
                    passwordStrength?.strength === 3 ? 'text-primary' : 'text-success'
                  }`}>
                    {passwordStrength?.label}
                  </span>
                </div>
                <div className="flex space-x-1.5">
                  {[1, 2, 3, 4]?.map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                        level <= passwordStrength?.strength ? passwordStrength?.color : 'bg-border/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={formData?.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
                error={errors?.confirmPassword}
                required
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-8"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={16} />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-2">
          Admin account
        </p>
        <h2 className="font-display text-2xl sm:text-[1.75rem] font-semibold tracking-tight text-foreground mb-2">
          {step.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
      </div>

      <div className="min-h-[160px]">{renderFields()}</div>
    </div>
  );
};

export default AdminAccountStep;

import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import useAuthStore from '../../../store/useAuthStore';

const AdminAccountStep = ({ formData, setFormData, errors, setErrors }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { user: authenticatedUser } = useAuthStore();
  const isLinking = !!authenticatedUser;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Real-time password confirmation validation
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
    
    let score = 0;
    const checks = {
      length: password?.length >= 8,
      lowercase: /[a-z]/?.test(password),
      uppercase: /[A-Z]/?.test(password),
      number: /\d/?.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/?.test(password)
    };
    
    score = Object.values(checks)?.filter(Boolean)?.length;
    
    if (score < 2) return { strength: 1, label: 'Weak', color: 'bg-error' };
    if (score < 4) return { strength: 2, label: 'Fair', color: 'bg-warning' };
    if (score < 5) return { strength: 3, label: 'Good', color: 'bg-primary' };
    return { strength: 4, label: 'Strong', color: 'bg-success' };
  };

  const passwordStrength = getPasswordStrength(formData?.password);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-card rounded-lg border border-border p-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Administrator Account</h2>
          <p className="text-muted-foreground">
            Create the primary administrator account for your company. This account will have full access to all system features and settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Personal Info */}
          <div className="space-y-6">
            <Input
              label="First Name"
              type="text"
              placeholder="Enter your first name"
              value={formData?.firstName}
              onChange={(e) => handleInputChange('firstName', e?.target?.value)}
              error={errors?.firstName}
              required
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

            <Input
              label="Email Address"
              type="email"
              placeholder="admin@yourcompany.com"
              value={formData?.email}
              onChange={(e) => handleInputChange('email', e?.target?.value)}
              error={errors?.email}
              required
              description="This will be your login email and primary contact"
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData?.phone}
              onChange={(e) => handleInputChange('phone', e?.target?.value)}
              error={errors?.phone}
              description="Optional: For account recovery and notifications"
            />
          </div>

          {/* Right Column - Security / Info */}
          <div className="space-y-6">
            {isLinking ? (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                  <Icon name="Link" size={24} />
                </div>
                <h3 className="text-lg font-bold text-blue-900">Linking to your account</h3>
                <p className="text-sm text-blue-700 leading-relaxed">
                  We've detected you're already logged in as <strong>{authenticatedUser.email}</strong>. 
                  This new company will be added to your existing account, allowing you to switch between workspaces instantly.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-white px-3 py-1 rounded-full border border-blue-200">
                    <Icon name="CheckCircle" size={12} />
                    Verified Identity
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData?.password}
                onChange={(e) => handleInputChange('password', e?.target?.value)}
                error={errors?.password}
                required
                description="Minimum 8 characters with uppercase, lowercase, number, and special character"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
              </Button>
            </div>

            {/* Password Strength Indicator */}
            {formData?.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Password Strength</span>
                  <span className={`text-sm font-medium ${
                    passwordStrength?.strength === 1 ? 'text-error' :
                    passwordStrength?.strength === 2 ? 'text-warning' :
                    passwordStrength?.strength === 3 ? 'text-primary' : 'text-success'
                  }`}>
                    {passwordStrength?.label}
                  </span>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4]?.map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded-full ${
                        level <= passwordStrength?.strength ? passwordStrength?.color : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
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
                <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={16} />
              </Button>
            </div>

            {/* Security Tips */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Icon name="Shield" size={16} className="text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Security Tips</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Use a unique password you haven't used elsewhere</li>
                    <li>• Include a mix of letters, numbers, and symbols</li>
                    <li>• Consider using a password manager</li>
                    <li>• Enable two-factor authentication after registration</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
        </div>

        {/* Admin Privileges Notice */}
        <div className="mt-8 bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Crown" size={20} className="text-primary mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Administrator Privileges</h4>
              <p className="text-sm text-muted-foreground mb-2">
                As the primary administrator, you will have access to:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full system configuration and settings management</li>
                <li>• Employee management and role assignments</li>
                <li>• Payroll processing and financial data access</li>
                <li>• System monitoring and audit trail reviews</li>
                <li>• Ability to create additional admin accounts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccountStep;
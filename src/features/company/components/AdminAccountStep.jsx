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
    <div className="p-6">
      <div className="mb-6 border-b border-border/50 pb-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">Administrator Account</h2>
        <p className="text-muted-foreground">
          Create the primary administrator credentials. This account will have full authority over all system features and settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
            description="Used for secure authentication and primary communication"
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData?.phone}
            onChange={(e) => handleInputChange('phone', e?.target?.value)}
            error={errors?.phone}
          />
        </div>

        {/* Right Column - Security / Info */}
        <div className="space-y-6">
          {isLinking ? (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 space-y-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 mb-2">
                <Icon name="Link" size={28} />
              </div>
              <h3 className="text-xl font-bold text-blue-900">Account Integration</h3>
              <p className="text-blue-700 leading-relaxed">
                You're currently authenticated as <strong>{authenticatedUser.email}</strong>. 
                We will link this new enterprise workspace to your existing profile for seamless management.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-white px-4 py-2 rounded-full border border-blue-200">
                  <Icon name="CheckCircle" size={14} />
                  IDENTITY VERIFIED
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="relative">
                <Input
                  label="Security Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a robust password"
                  value={formData?.password}
                  onChange={(e) => handleInputChange('password', e?.target?.value)}
                  error={errors?.password}
                  required
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
                  type={showConfirmPassword ? "text" : "password"}
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
                  <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={16} />
                </Button>
              </div>

              {/* Security Tips */}
              <div className="bg-success/5 border border-success/20 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center text-success mt-1 shrink-0">
                    <Icon name="ShieldCheck" size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">Security Standards</h4>
                    <ul className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                      <li>• Use a phrase unique to your enterprise</li>
                      <li>• Combine uppercase, numbers, and symbols</li>
                      <li>• Rotate your credentials periodically</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Admin Privileges Notice */}
      <div className="mt-12 bg-[#1E293B] text-white rounded-2xl p-8 overflow-hidden relative">
        <Icon name="Crown" size={120} className="absolute -right-10 -bottom-10 opacity-5 text-white" />
        <div className="flex items-start space-x-6 relative z-10">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
            <Icon name="Crown" size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold mb-2">Primary Administrator Authority</h4>
            <p className="text-blue-100/70 text-sm mb-6 max-w-xl">
              You are establishing the root authority for this workspace. This account will have immutable access to core security, payroll, and infrastructure settings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-xs font-medium text-blue-100">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                WORKSPACE GOVERNANCE
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-blue-100">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                PAYROLL INFRASTRUCTURE
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-blue-100">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                AUDIT & COMPLIANCE
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-blue-100">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                RESOURCE ALLOCATION
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccountStep;
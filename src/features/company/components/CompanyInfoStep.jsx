import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

export const COMPANY_MINI_STEPS = [
  {
    key: 'name',
    title: 'What is your company name?',
    description: 'This will be displayed across your dashboard and reports.',
    required: true,
    fields: ['companyName'],
  },
  {
    key: 'website',
    title: 'Do you have a company website?',
    description: 'Optional — you can add this later anytime.',
    required: false,
    fields: ['website'],
  },
  {
    key: 'classification',
    title: 'Tell us about your business',
    description: 'Industry and size help us tailor features and pricing.',
    required: true,
    fields: ['industry', 'companySize'],
  },
  {
    key: 'logo',
    title: 'Add your company logo',
    description: 'Optional — upload a PNG, JPG, or SVG (max 5MB).',
    required: false,
    fields: ['logo'],
  },
  {
    key: 'location',
    title: 'Where is your company based?',
    description: 'Country is required. Address details are optional.',
    required: true,
    fields: ['country', 'address', 'city', 'postalCode'],
  },
];

const CompanyInfoStep = ({ formData, setFormData, errors, setErrors, miniStep = 0 }) => {
  const step = COMPANY_MINI_STEPS[miniStep] || COMPANY_MINI_STEPS[0];

  const industryOptions = [
    { value: 'technology', label: 'Technology & Software' },
    { value: 'healthcare', label: 'Healthcare & Medical' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'education', label: 'Education & Training' },
    { value: 'consulting', label: 'Consulting Services' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'hospitality', label: 'Hospitality & Tourism' },
    { value: 'construction', label: 'Construction & Engineering' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'nonprofit', label: 'Non-profit Organization' },
    { value: 'other', label: 'Other' }
  ];

  const companySizeOptions = [
    { value: '1-10', label: '1-10 employees (Startup)', description: 'Perfect for small teams and growing businesses' },
    { value: '11-50', label: '11-50 employees (Small Business)', description: 'Ideal for established small companies' },
    { value: '51-200', label: '51-200 employees (Medium Business)', description: 'Great for expanding organizations' },
    { value: '201-1000', label: '201-1000 employees (Large Business)', description: 'Comprehensive features for large teams' },
    { value: '1000+', label: '1000+ employees (Enterprise)', description: 'Full enterprise-grade capabilities' }
  ];

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
  };

  const handleLogoUpload = (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      if (file?.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          logo: 'Logo file size must be less than 5MB'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          logo: e?.target?.result,
          logoFile: file
        }));
        setErrors(prev => ({
          ...prev,
          logo: ''
        }));
      };
      reader?.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo: '',
      logoFile: null
    }));
  };

  const renderFields = () => {
    switch (step.key) {
      case 'name':
        return (
          <Input
            label="Company Name"
            type="text"
            placeholder="Enter your company name"
            value={formData?.companyName}
            onChange={(e) => handleInputChange('companyName', e?.target?.value)}
            error={errors?.companyName}
            required
            autoFocus
          />
        );

      case 'website':
        return (
          <Input
            label="Company Website"
            type="url"
            placeholder="https://www.yourcompany.com"
            value={formData?.website}
            onChange={(e) => handleInputChange('website', e?.target?.value)}
            error={errors?.website}
            description="Optional: Your company's official website"
            autoFocus
          />
        );

      case 'classification':
        return (
          <div className="space-y-6">
            <Select
              label="Industry"
              placeholder="Select your industry"
              options={industryOptions}
              value={formData?.industry}
              onChange={(value) => handleInputChange('industry', value)}
              error={errors?.industry}
              required
              searchable
              description="This helps us provide industry-specific features"
            />
            <Select
              label="Company Size"
              placeholder="Select number of employees"
              options={companySizeOptions}
              value={formData?.companySize}
              onChange={(value) => handleInputChange('companySize', value)}
              error={errors?.companySize}
              required
              description="Determines available features and pricing tier"
            />
          </div>
        );

      case 'logo':
        return (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Company Logo
            </label>
            <p className="text-xs text-muted-foreground mb-4">
              Upload your company logo (PNG, JPG, SVG - Max 5MB)
            </p>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center max-w-md mx-auto">
              {formData?.logo ? (
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={formData?.logo}
                      alt="Company logo preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      iconName="Upload"
                      iconPosition="left"
                    >
                      Change Logo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeLogo}
                      iconName="Trash2"
                      iconPosition="left"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
                    <Icon name="Upload" size={24} className="text-muted-foreground" />
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      iconName="Upload"
                      iconPosition="left"
                    >
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Drag and drop or click to browse
                    </p>
                  </div>
                </div>
              )}

              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
            {errors?.logo && (
              <p className="text-sm text-error mt-2 text-center">{errors?.logo}</p>
            )}
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <Input
              label="Country"
              type="text"
              placeholder="Country"
              value={formData?.country}
              onChange={(e) => handleInputChange('country', e?.target?.value)}
              error={errors?.country}
              required
              autoFocus
            />
            <Input
              label="Company Address"
              type="text"
              placeholder="Enter your company address"
              value={formData?.address}
              onChange={(e) => handleInputChange('address', e?.target?.value)}
              error={errors?.address}
              description="Optional — main office or headquarters"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                type="text"
                placeholder="City"
                value={formData?.city}
                onChange={(e) => handleInputChange('city', e?.target?.value)}
                error={errors?.city}
              />
              <Input
                label="Postal Code"
                type="text"
                placeholder="ZIP/Postal Code"
                value={formData?.postalCode}
                onChange={(e) => handleInputChange('postalCode', e?.target?.value)}
                error={errors?.postalCode}
              />
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
          Company profile
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

export default CompanyInfoStep;

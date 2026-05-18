import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const CompanyInfoStep = ({ formData, setFormData, errors, setErrors }) => {
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
    
    // Clear error when user starts typing
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
      if (file?.size > 5 * 1024 * 1024) { // 5MB limit
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

  return (
    <div className="p-6">
      <div className="mb-6 border-b border-border/50 pb-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">Company Profile</h2>
        <p className="text-muted-foreground">
          Provide your business details to help us customize your experience and configure your enterprise workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <Input
              label="Company Name"
              type="text"
              placeholder="Enter your company name"
              value={formData?.companyName}
              onChange={(e) => handleInputChange('companyName', e?.target?.value)}
              error={errors?.companyName}
              required
              description="This will be displayed across your dashboard and reports"
            />

            <Input
              label="Company Website"
              type="url"
              placeholder="https://www.yourcompany.com"
              value={formData?.website}
              onChange={(e) => handleInputChange('website', e?.target?.value)}
              error={errors?.website}
              description="Optional: Your company's official website"
            />

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

          {/* Right Column - Logo & Address */}
          <div className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Company Logo
              </label>
              <p className="text-xs text-muted-foreground mb-4">
                Upload your company logo (PNG, JPG, SVG - Max 5MB)
              </p>
              
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {formData?.logo ? (
                  <div className="space-y-4">
                    <div className="w-24 h-24 mx-auto bg-muted rounded-lg overflow-hidden">
                      <Image
                        src={formData?.logo}
                        alt="Company logo preview showing uploaded brand image"
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
                      <Icon name="Building2" size={24} className="text-muted-foreground" />
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
                <p className="text-sm text-error mt-2">{errors?.logo}</p>
              )}
            </div>

            {/* Address Information */}
            <Input
              label="Company Address"
              type="text"
              placeholder="Enter your company address"
              value={formData?.address}
              onChange={(e) => handleInputChange('address', e?.target?.value)}
              error={errors?.address}
              description="Main office or headquarters address"
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

            <Input
              label="Country"
              type="text"
              placeholder="Country"
              value={formData?.country}
              onChange={(e) => handleInputChange('country', e?.target?.value)}
              error={errors?.country}
              required
            />
          </div>
        </div>
      </div>
  );
};

export default CompanyInfoStep;
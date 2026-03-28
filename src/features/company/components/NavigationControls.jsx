import React from 'react';
import Button from '../../../components/ui/Button';


const NavigationControls = ({ 
  currentStep, 
  totalSteps, 
  onPrevious, 
  onNext, 
  onComplete, 
  isLoading, 
  canProceed 
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="bg-card border-t border-border p-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left Side - Previous Button */}
        <div className="flex-1">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading}
              iconName="ChevronLeft"
              iconPosition="left"
            >
              Previous
            </Button>
          )}
        </div>

        {/* Center - Step Indicator */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
        </div>

        {/* Right Side - Next/Complete Button */}
        <div className="flex-1 flex justify-end">
          {isLastStep ? (
            <Button
              variant="default"
              onClick={onComplete}
              disabled={!canProceed || isLoading}
              loading={isLoading}
              iconName="Check"
              iconPosition="right"
            >
              Complete Registration
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={onNext}
              disabled={!canProceed || isLoading}
              loading={isLoading}
              iconName="ChevronRight"
              iconPosition="right"
            >
              Next Step
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mt-4">
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Help Text */}
      <div className="max-w-4xl mx-auto mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Need help? Contact our support team at{' '}
          <button className="text-primary hover:text-primary/80 font-medium">
            support@crmhrm.com
          </button>
          {' '}or call{' '}
          <button className="text-primary hover:text-primary/80 font-medium">
            +91 (5995) 123-4567
          </button>
        </p>
      </div>
    </div>
  );
};

export default NavigationControls;
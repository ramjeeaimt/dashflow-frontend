import React from 'react';
import Button from '../../../components/ui/Button';

const NavigationControls = ({
  onPrevious,
  onNext,
  onComplete,
  onSkip,
  isLoading,
  canProceed,
  canSkip = false,
  showBack = true,
  isLastStep = false,
  compact = false,
}) => {
  return (
    <div className={compact ? '' : 'bg-card border-t border-border p-6'}>
      <div
        className={`flex items-center justify-between gap-3 ${
          compact ? '' : 'max-w-4xl mx-auto'
        }`}
      >
        <div className="flex-1">
          {showBack && (
            <Button
              variant="ghost"
              onClick={onPrevious}
              disabled={isLoading}
              iconName="ChevronLeft"
              iconPosition="left"
            >
              Back
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canSkip && (
            <Button variant="ghost" onClick={onSkip} disabled={isLoading}>
              Skip
            </Button>
          )}

          {isLastStep ? (
            <Button
              variant="default"
              onClick={onComplete}
              disabled={!canProceed || isLoading}
              loading={isLoading}
              iconName="Check"
              iconPosition="right"
            >
              Complete Setup
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
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationControls;

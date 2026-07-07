import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressIndicator = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps?.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <React.Fragment key={step?.id}>
              <div className="flex flex-col items-center flex-1 relative group">
                {/* Connector Line */}
                {index < steps?.length - 1 && (
                  <div className={`absolute left-[50%] right-[-50%] top-5 h-0.5 transition-all duration-500 ${
 isCompleted ? 'bg-primary' : 'bg-border'
 }`} />
                )}

                {/* Step Circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${
 isCompleted 
 ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20' 
 : isActive 
 ? 'bg-card border-primary text-primary ring-4 ring-primary/10' 
 : 'bg-card border-border text-muted-foreground'
 }`}>
                  {isCompleted ? (
                    <Icon name="Check" size={18} strokeWidth={3} />
                  ) : (
                    <span className="text-sm font-bold">{stepNumber}</span>
                  )}
                </div>
                
                {/* Step Text */}
                <div className="mt-4 text-center">
                  <p className={`text-sm font-bold transition-colors duration-300 ${
 isActive ? 'text-foreground' : isCompleted ? 'text-primary' : 'text-muted-foreground'
 }`}>
                    {step?.title}
                  </p>
                  <p className="hidden md:block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1 opacity-60">
                    {step?.description}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
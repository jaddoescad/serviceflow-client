type StepIndicatorProps = {
  currentStep: 1 | 2 | 3;
  step1Label?: string;
  step2Label?: string;
  step3Label?: string;
  totalSteps?: 2 | 3;
};

export function StepIndicator({
  currentStep,
  step1Label = "Details",
  step2Label = "Confirmation",
  step3Label = "Automations",
  totalSteps = 2,
}: StepIndicatorProps) {
  const getStepClasses = (step: number) => {
    if (currentStep === step) {
      return "bg-blue-600 text-white";
    }
    if (currentStep > step) {
      return "bg-blue-100 text-blue-600";
    }
    return "bg-slate-200 text-slate-500";
  };

  const getLabelClasses = (step: number) => {
    return currentStep === step ? "text-slate-900" : "text-slate-500";
  };

  const renderCheckmark = () => (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );

  return (
    <div className="flex items-center gap-2">
      {/* Step 1 */}
      <div className="flex items-center gap-1.5">
        <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${getStepClasses(1)}`}>
          {currentStep > 1 ? renderCheckmark() : "1"}
        </div>
        <span className={`text-[11px] font-medium ${getLabelClasses(1)}`}>
          {step1Label}
        </span>
      </div>

      <div className="h-px w-4 bg-slate-300" />

      {/* Step 2 */}
      <div className="flex items-center gap-1.5">
        <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${getStepClasses(2)}`}>
          {currentStep > 2 ? renderCheckmark() : "2"}
        </div>
        <span className={`text-[11px] font-medium ${getLabelClasses(2)}`}>
          {step2Label}
        </span>
      </div>

      {/* Step 3 (optional) */}
      {totalSteps === 3 && (
        <>
          <div className="h-px w-4 bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${getStepClasses(3)}`}>
              3
            </div>
            <span className={`text-[11px] font-medium ${getLabelClasses(3)}`}>
              {step3Label}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

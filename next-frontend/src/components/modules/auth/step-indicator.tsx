import { Progress } from "@/components/ui/progress";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  const steps = [
    { title: "Account Info", description: "Personal Credentials" },
    { title: "Company Details", description: "Business Profile" },
    { title: "Platform Intent", description: "Your Objectives" },
  ];

  return (
    <div className="w-full space-y-4 mb-8">
      <div className="flex justify-between items-center text-sm font-medium">
        <span className="text-primary font-semibold">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-muted-foreground">
          {steps[currentStep - 1].title}
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground pt-1">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={
              idx + 1 === currentStep
                ? "text-primary font-bold"
                : idx + 1 < currentStep
                  ? "text-foreground font-medium"
                  : ""
            }
          >
            {step.title}
          </div>
        ))}
      </div>
    </div>
  );
}

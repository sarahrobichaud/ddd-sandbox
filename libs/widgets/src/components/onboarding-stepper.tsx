import { useState, useCallback, ReactNode } from "react";
import { Stepper, StepperItem, StepperContent, type StepStatus } from "@cavok/ui/components/shad/stepper";
import { Button } from "@cavok/ui/components/shad/button";
import { useStepper } from "@cavok/ui/hooks/use-stepper";
import { Card, CardContent, CardFooter } from "@cavok/ui/components/shad/card";
import { Progress } from "@cavok/ui/components/shad/progress";
import clsx from "clsx";
import { OnboardingStep } from "@cavok/core/values";

export interface OnboardingStepEntry {
  id: OnboardingStep;
  label: string;
  description?: string;
  content: ReactNode;
  validate?: () => Promise<boolean>;
}

export interface OnboardingStepperProps {
  steps: OnboardingStepEntry[];
  initialStepIndex?: number;
  isLoading?: boolean;
  onStepChange?: () => void;
  isInvalid?: boolean;
  onComplete?: () => void;
  labels?: {
    next?: string;
    back?: string;
    finish?: string;
  };
}

export function OnboardingStepper({
  steps,
  initialStepIndex = 0,
  onStepChange,
  labels = {},
  isLoading = false,
  isInvalid = false,
  onComplete
}: OnboardingStepperProps) {
  const stepper = useStepper({ stepCount: steps.length, initialIndex: initialStepIndex });

  const { next: nextLabel = "Next", back: backLabel = "Back", finish: finishLabel = "Finish" } = labels;

  const currentStep = steps[stepper.cursor];

  const [meta, setMeta] = useState<Record<string, Record<string, boolean>>>(() =>
    Object.fromEntries(steps.map((step) => [step.id, {}]))
  );

  const canInteract = !isLoading;

  const getMeta = (index?: number) => {
    return meta[index ? steps[index].id : currentStep.id];
  };

  const getStepStatus = (index?: number): StepStatus => {
    const meta = getMeta(index);

    if (index !== undefined && index < stepper.cursor) {
      return "completed";
    }

    if (stepper.cursor === index) {
      if (!canInteract) {
        return "loading";
      }

      if (meta?.isInvalid) {
        return "error";
      }

      return "current";
    }

    return "upcoming";
  };

  const onNext = async () => {
    const isValid = await currentStep.validate?.();

    console.log("next", { isValid });

    if (!isValid) {
      setMeta((prev) => {
        return {
          ...prev,
          [currentStep.id]: {
            isInvalid: true,
          },
        };
      });
      return;
    }
    console.log("going to next", stepper.cursor);

    setMeta((prev) => {
      return {
        ...prev,
        [currentStep.id]: {
          isInvalid: false,
        },
      };
    });

    if(stepper.isFinalPage) {
      onComplete?.();
      return;
    }

    onStepChange?.();
    stepper.next();
  };

  const onPrevious = async () => {
    onStepChange?.();
    stepper.previous();
  };

  return (
    <div className="flex lg:flex-row flex-col w-full align-center gap-8 px-4 md:px-0">
      {/* Stepper Navigation */}
      <div className="w-64 shrink-0 hidden md:block">
        <div className="sticky top-4">
          <Stepper orientation="vertical">
            {steps.map((step, index) => (
              <StepperItem
                key={step.id}
                status={getStepStatus(index)}
                stepNumber={index + 1}
                isLast={index === steps.length - 1}
              >
                <StepperContent title={step.label} description={step.description} />
              </StepperItem>
            ))}
          </Stepper>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6">
              <Progress
                value={stepper.progressPercentage}
                className={clsx("h-2", meta[currentStep.id]?.isInvalid && "[&>*]:bg-destructive bg-destructive/20")}
              />
              <div className="flex justify-between text-sm text-muted-foreground">

              <p className="text-sm text-muted-foreground mt-2">
                Step {stepper.stepNumber} of {stepper.totalSteps}
              </p>
              <p className="mt-2">{stepper.progressPercentage}%</p>
              </div>
            </div>

            <div className="min-h-[200px]">{currentStep.content}</div>
          </CardContent>

          <CardFooter className="flex justify-between border-t">
            <Button variant="outline" onClick={onPrevious} disabled={!stepper.hasPreviousPage || !canInteract}>
              {backLabel}
            </Button>

            <Button onClick={onNext} disabled={(!stepper.hasNextPage  && !stepper.isFinalPage)|| !canInteract || isInvalid}>
              {!canInteract ? "Validating..." : stepper.isFinalPage ? finishLabel : nextLabel}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

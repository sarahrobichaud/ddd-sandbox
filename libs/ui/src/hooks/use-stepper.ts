import { useState } from "react";

export type UseStepperArgs = {
  stepCount: number;
  initialIndex?: number;
  debug?: boolean;
};
export function useStepper({ stepCount, initialIndex, debug = false }: UseStepperArgs) {
  const isWithinRange = (index: number) => index < stepCount - 1 || index >= 0;

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialIndex && isWithinRange(initialIndex)) {
      return initialIndex;
    }

    return 0;
  });

  const progressPercentage = Math.round(((currentIndex + 1) * 100) / stepCount);

  const next = () => {
    if (currentIndex < stepCount - 1) {
      if (debug) {
        console.warn("tried to navigate the nex page from last page");
      }
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const previous = () => {
    if (currentIndex > 0) {
      if (debug) {
        console.warn("Tried to navigate backwards from first page");
      }
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const navigate = (index: number) => {
    if (index >= stepCount - 1 || index < 0) {
      if (debug) {
        console.log(`Failed to navigated to index ${index}, max range 0-${stepCount - 1}`);
      }

      setCurrentIndex(index);
    }
  };

  return {
    cursor: currentIndex,
    next,
    previous,
    navigate,
    stepNumber: currentIndex + 1,
    totalSteps: stepCount,
    progressPercentage,
    isFinalPage : currentIndex === stepCount -1,
    hasNextPage: currentIndex < stepCount-1,
    hasPreviousPage: currentIndex > 0,
  };
}

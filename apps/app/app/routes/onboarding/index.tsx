import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { OnboardingStepper, type OnboardingStepEntry } from "@cavok/widgets/components/onboarding-stepper";
import { WelcomeStep } from "./components/welcome-step";
import { CompleteStep } from "./components/complete-step";
import { getUserId } from "~/data/store/auth-store";
import type { CompletePresenceStepCommand } from "@cavok/core/contracts/onboarding.contracts";
import { OnboardingPresenceStepForm } from "./forms/obd-presence-form";
import { VALUE } from "@cavok/core/values";
import {
  useCompleteOnboarding as useCompleteOnboardingMutation,
  useCompletePresenceStep as useCompletePresenceStepMutation,
  useCompleteWelcomeStep as useCompleteWelcomeStepMutation,
  useOnboardingStatus,
} from "~/data/api/onboarding-queries";
import { usePresenceOnboardingForm } from "./hooks/use-presence-step";

export default function OnboardingRoute() {
  const navigate = useNavigate();
  const userId = getUserId();

  const { query: onboardingStatusQuery, queryKey: statusQueryKey } = useOnboardingStatus({
    userId: userId || "",
    queryOptions: {
      enabled: !!userId,
    },
  });

  // Derive presence data from query result
  const presenceData = useMemo<CompletePresenceStepCommand>(() => {
    const serverPresenceData = onboardingStatusQuery.data?.presenceData;

    if (serverPresenceData && userId) {
      return {
        userId,
        presenceData: {
          displayName: serverPresenceData.displayName || "",
          firstName: serverPresenceData.firstName || "",
          lastName: serverPresenceData.lastName || "",
          pronouns: serverPresenceData.pronouns || "",
          experienceLevel: serverPresenceData.experienceLevel || "BEGINNER",
          homeAirport: serverPresenceData.homeAirport || "",
        },
      };
    }

    return {
      userId: userId || "",
      presenceData: {
        displayName: "",
        firstName: "",
        lastName: "",
        experienceLevel: "BEGINNER",
        homeAirport: "",
        pronouns: "",
      },
    };
  }, [onboardingStatusQuery.data?.presenceData, userId]);

  // Use mutation hooks - you could also invalidate the user profile here if needed
  const { mutation: completeWelcomeMutation } = useCompleteWelcomeStepMutation({
    userId: userId || "",
    keysToInvalidate: [] as const, // Add other keys here if needed, e.g., [["me"]]
  });

  const { mutation: completePresenceMutation } = useCompletePresenceStepMutation({
    userId: userId || "",
    keysToInvalidate: [] as const,
  });

  const { mutation: completeOnboardingMutation } = useCompleteOnboardingMutation({
    userId: userId || "",
    keysToInvalidate: [["me"]] as const, // Invalidate user profile when onboarding completes
  });

  const presenceStep = usePresenceOnboardingForm({ defaultValues: presenceData, mutation: completePresenceMutation });

  const steps: OnboardingStepEntry[] = [
    {
      id: VALUE.ONBOARDING_STEP.WELCOME,
      label: "Welcome",
      description: "Get started",
      content: <WelcomeStep />,
      validate: async () => {
        console.log("das");

        if (onboardingStatusQuery.data?.completedSteps.includes(VALUE.ONBOARDING_STEP.WELCOME)) {
          return true;
        }

        try {
          await completeWelcomeMutation.mutateAsync({ userId: userId || "" });

          return true;
        } catch (error) {
          console.error("Welcome step failed:", error);
          return false;
        }
      },
    },
    {
      id: VALUE.ONBOARDING_STEP.PRESENCE,
      label: "Presence",
      description: "How you'll be seen by others",
      content: <OnboardingPresenceStepForm form={presenceStep.form} username={presenceStep.username} />,
      validate: async () => {
        // Use this instead of submit
        await presenceStep.form._handleSubmit();
        console.log("done");

        return presenceStep.form.state.isValid;
      },
    },
    {
      id: VALUE.ONBOARDING_STEP.COMPLETED,
      label: "Complete",
      description: "All done!",
      content: <CompleteStep />,
      validate: async () => {
        try {
          await completeOnboardingMutation.mutateAsync({ userId: userId || "" });

          return true;
        } catch (error) {
          return false;
        }
      },
    },
  ];

  const onStepChange = () => {
  };


  if (onboardingStatusQuery.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-16">
      <OnboardingStepper
        steps={steps}
        initialStepIndex={steps.findIndex((step) => !onboardingStatusQuery.data?.completedSteps.includes(step.id))}
        onStepChange={onStepChange}
        onComplete={() => navigate('/')}
        isLoading={
          completeWelcomeMutation.isPending ||
          completePresenceMutation.isPending ||
          completeOnboardingMutation.isPending
        }
        labels={{
          next: "Continue",
          back: "Back",
          finish: "Complete Setup",
        }}
      />
    </div>
  );
}

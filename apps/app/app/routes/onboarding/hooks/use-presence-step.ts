import { createContext } from "react";
import {
  completePresenceStepSchema,
  type CompletePresenceStepCommand,
  type OnboardingProgressDTO,
} from "@cavok/core/contracts/onboarding.contracts";
import { getUserId, useUsername } from "~/data/store/auth-store";
import { useAppForm } from "~/utils/form-utils";
import type { SkillLevel } from "@cavok/core/values";
import { formOptions, revalidateLogic } from "@tanstack/react-form";
import type { UseMutationResult } from "@tanstack/react-query";
import { ValidationError } from "~/data/api/api-client";

export type usePresenceStepArgs = {
  defaultValues: CompletePresenceStepCommand;
  mutation: UseMutationResult<OnboardingProgressDTO, any, any, any>;
};

export const usePresenceFormOptions = (mutation?: usePresenceStepArgs["mutation"]) =>
  formOptions({
    defaultValues: {
      userId: "",
      presenceData: {
        displayName: "",
        firstName: "",
        lastName: "",
        pronouns: "",
        experienceLevel: "" as SkillLevel,
        homeAirport: "",
      },
    } satisfies CompletePresenceStepCommand,
    validators: {
      onChange: ({ formApi }) => {
        if (formApi.state.submissionAttempts === 0) {
          return;
        }

        return formApi.parseValuesWithSchema(completePresenceStepSchema);
      },
      onSubmitAsync: async ({ value, formApi, signal }) => {
        if (!!formApi.state.errors.length) {
          return;
        }

        try {
          await mutation?.mutateAsync(value);
          return;
        } catch (err) {
          if (err instanceof ValidationError) {
            for (const error of err.getAllErrors()) {
              console.log({ error });
              formApi.fieldInfo[error.field as keyof typeof formApi.fieldInfo].instance?.setErrorMap({
                onSubmit: { message: error.message },
              });
            }
          }
        }
      },
    },
  });

export function usePresenceOnboardingForm({ defaultValues, mutation }: usePresenceStepArgs) {
  const username = useUsername();
  const userId = getUserId();
  const options = usePresenceFormOptions(mutation);

  const form = useAppForm({
    ...options,
    defaultValues: defaultValues ?? options.defaultValues,
  });
  console.log(form.state.errors);

  return {
    username,
    userId,
    form,
    hasErrors: !!form.state.errors.length,
  };
}

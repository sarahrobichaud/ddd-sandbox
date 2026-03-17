// apps/app/app/data/api/onboarding-queries.ts

import type { ApiResponse } from "@cavok/core/contracts/rest-api.contracts";
import type {
  OnboardingProgressDTO,
  CompletePresenceStepCommand,
} from "@cavok/core/contracts/onboarding.contracts";
import { getAccessToken } from "../store/auth-store";
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { apiCall } from "./api-client";

export const BASE_URL = "http://localhost:8080";

// ============================================
// Query Keys Factory
// ============================================
export const onboardingKeys = {
  all: ["onboarding"] as const,
  statuses: () => [...onboardingKeys.all, "status"] as const,
  status: (userId: string) => [...onboardingKeys.statuses(), userId] as const,
};

// ============================================
// API Functions
// ============================================

export const getOnboardingStatus = async ({ userId }: { userId: string }) => {
  const result = await apiCall<ApiResponse<OnboardingProgressDTO>>(`/v1/onboarding/status/${userId}`, {});

  if (result.status === "error") {
    throw new Error(result.error.detail || result.error.title || "Failed to get onboarding status");
  }

  return result.data;
};

export const completeWelcomeStep = async ({ userId }: { userId: string }) => {
  const result = await apiCall<ApiResponse<OnboardingProgressDTO>>(`/v1/onboarding/complete/welcome/${userId}`, {
    method: "POST",
  });

  if (result.status === "error") {
    throw new Error(result.error.detail || result.error.title || "Failed to complete welcome step");
  }

  return result.data;
};

export const completePresenceStep = async (data: CompletePresenceStepCommand) => {
  const result = await apiCall<ApiResponse<OnboardingProgressDTO>>(`/v1/onboarding/complete/presence/${data.userId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (result.status === "error") {
    throw new Error(result.error.detail || result.error.title || "Failed to complete presence step");
  }

  return result.data;
};

export const completeOnboarding = async ({ userId }: { userId: string }) => {
  const result = await apiCall<ApiResponse<OnboardingProgressDTO>>(`/v1/onboarding/complete/${userId}`, {
    method: "POST",
  });

  if (result.status === "error") {
    throw new Error(result.error.detail || result.error.title || "Failed to complete onboarding");
  }

  return result.data;
};

// ============================================
// Hooks
// ============================================

interface UseOnboardingStatusOptions {
  userId: string;
  queryOptions?: Omit<UseQueryOptions<OnboardingProgressDTO | null>, "queryKey" | "queryFn">;
}

export const useOnboardingStatus = ({ userId, queryOptions }: UseOnboardingStatusOptions) => {
  const queryKey = onboardingKeys.status(userId);

  const query = useQuery({
    queryKey,
    queryFn: () => getOnboardingStatus({ userId }),
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    ...queryOptions,
  });

  return {
    query,
    queryKey,
  };
};

interface UseCompleteStepOptions {
  userId: string;
  keysToInvalidate?: Array<readonly unknown[]>;
}

export const useCompleteWelcomeStep = ({ userId, keysToInvalidate = [] }: UseCompleteStepOptions) => {
  const queryClient = useQueryClient();
  const statusKey = onboardingKeys.status(userId);

  const mutation = useMutation({
    mutationFn: completeWelcomeStep,

    // Optimistic update for instant UI feedback
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: statusKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<OnboardingProgressDTO>(statusKey);

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<OnboardingProgressDTO>(statusKey, {
          ...previousData,
          currentStep: "PRESENCE",
          completedSteps: previousData.completedSteps.includes("WELCOME")
            ? previousData.completedSteps
            : [...previousData.completedSteps, "WELCOME"],
        });
      }

      return { previousData };
    },

    onError: (err, data, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(statusKey, context.previousData);
      }
    },

    onSettled: async () => {
      // Always refetch to ensure sync
      await queryClient.invalidateQueries({ queryKey: statusKey });

      // Invalidate additional keys if provided
      for (const key of keysToInvalidate) {
        await queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });

  return {
    mutation,
    mutationKey: ["onboarding", "complete", "welcome"] as const,
    invalidates: [statusKey, ...keysToInvalidate],
  };
};

export const useCompletePresenceStep = ({ userId, keysToInvalidate = [] }: UseCompleteStepOptions) => {
  const queryClient = useQueryClient();
  const statusKey = onboardingKeys.status(userId);

  const mutation = useMutation({
    mutationFn: completePresenceStep,

    // Optimistic update for instant UI feedback
    onSettled: async () => {
      // Always refetch to ensure sync
      await queryClient.invalidateQueries({ queryKey: statusKey });

      // Invalidate additional keys if provided
      for (const key of keysToInvalidate) {
        await queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });

  return {
    mutation,
    mutationKey: ["onboarding", "complete", "presence"] as const,
    invalidates: [statusKey, ...keysToInvalidate],
  };
};

export const useCompleteOnboarding = ({ userId, keysToInvalidate = [] }: UseCompleteStepOptions) => {
  const queryClient = useQueryClient();
  const statusKey = onboardingKeys.status(userId);

  const mutation = useMutation({
    mutationFn: completeOnboarding,

    onSettled: async () => {
      // Always refetch to ensure sync
      await queryClient.invalidateQueries({ queryKey: statusKey });

      // Invalidate additional keys if provided
      for (const key of keysToInvalidate) {
        await queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });

  return {
    mutation,
    mutationKey: ["onboarding", "complete", "final"] as const,
    invalidates: [statusKey, ...keysToInvalidate],
  };
};

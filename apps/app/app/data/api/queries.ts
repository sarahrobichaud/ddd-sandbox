import { QueryClient } from "@tanstack/react-query";
import { getAccessToken } from "../store/auth-store";
import type { ApiResponse } from "@cavok/core/contracts/rest-api.contracts";
import type { Identity } from "@cavok/core/contracts/auth.contracts";
import { apiCall } from "./api-client";

export const BASE_URL = "http://localhost:8080";

export const queryClient = new QueryClient();

export const userProfile = {
  queryKey: ["me"],
  queryFn: async () => {
    const result = await apiCall<ApiResponse<Identity>>(`/v1/identity/me`);

    // Check if response is successful
    if (result.status === "error") {
      throw new Error(result.error.detail || result.error.title);
    }

    return result.data;
  },
};

export const queries = {
  me: {
    profile: userProfile,
  },
} as const;

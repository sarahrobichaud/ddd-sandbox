export const BASE_URL = "http://localhost:8080";

import type { AuthenticationResult } from "@cavok/core/contracts/auth.contracts";
import type { ApiResponse } from "@cavok/core/contracts/rest-api.contracts";
import { getRefreshToken } from "../store/auth-store";

export const signIn = async ({ email, password }: { email: string; password: string }) => {
  try {
    const response = await fetch(`${BASE_URL}/v1/identity/auth/sign-in`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-Auth-Method": "cookie",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = (await response.json()) as ApiResponse<AuthenticationResult>;

    // Check if response is successful
    if (result.status === "error") {
      console.error("Sign in failed:", result.error);
      return null;
    }

    return result.data;
  } catch (err) {
    console.error("Sign in error:", err);
    return null;
  }
};

export const refreshSession = async () => {
  const refreshToken = getRefreshToken();
  console.log({ refreshToken });
  try {
    const response = await fetch(`${BASE_URL}/v1/identity/session/renew`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Invalid Session");
    }

    const result = (await response.json()) as ApiResponse<AuthenticationResult>;

    // Check if response is successful
    if (result.status === "error") {
      console.error("Session refresh failed:", result.error);
      return null;
    }

    return result.data;
  } catch (err) {
    console.error("Session refresh error:", err);
    return null;
  }
};

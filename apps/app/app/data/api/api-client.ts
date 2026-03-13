import type {
  ApiErrorResponse,
  DomainError,
  HttpErrorDetail,
  HttpErrorResponse,
} from "@cavok/core/contracts/rest-api.contracts";
import { getAccessToken, getActions } from "../store/auth-store";
import { refreshSession } from "./auth-queries";
import { dataTagErrorSymbol } from "@tanstack/react-query";

export const BASE_URL = "http://localhost:8080";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Custom fetch wrapper that handles automatic session refresh on 401
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();

  // Prepare headers with authentication
  const headers: HeadersInit = {
    ...options.headers,
  } as Record<string, string>;

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === "string" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Make the initial request
  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  // If we get a 401, try to refresh the session
  if (response.status === 401 && !isRefreshing) {
    // Prevent multiple simultaneous refresh attempts
    if (!refreshPromise) {
      isRefreshing = true;
      refreshPromise = handleSessionRefresh();
    }

    const refreshed = await refreshPromise;

    // Reset the refresh state
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      // Retry the original request with the new token
      const newToken = getAccessToken();
      headers["Authorization"] = `Bearer ${newToken}`;

      response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers,
      });
    } else {
      // Refresh failed, redirect to login
      window.location.href = "/auth";
      throw new Error("Session expired. Please log in again.");
    }
  }

  return response;
}

/**
 * Handles the session refresh logic
 */
async function handleSessionRefresh(): Promise<boolean> {
  try {
    const result = await refreshSession();

    if (!result) {
      return false;
    }

    // Update the auth store with new tokens
    const { renewSession } = getActions();
    renewSession(result);

    return true;
  } catch (error) {
    console.error("Failed to refresh session:", error);
    return false;
  }
}

export class InternalError extends Error {
  constructor() {
    super("Internal Error");
  }
}

export class ValidationError extends Error {
  #errors: HttpErrorDetail[];
  constructor(errors: HttpErrorDetail[]) {
    super("Validation Error");
    this.#errors = errors;
  }

  getAllErrors() {
    return this.#errors;
  }
}

/**
 * Helper to make JSON API calls with automatic error handling
 */
export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await apiFetch(endpoint, options);
    if (response.status === 400) {
      const data = (await response.json()) as HttpErrorResponse;
      console.log({ data, response });
      throw new ValidationError(data.error.errors);
    }
    return response.json();
  } catch (err) {
    console.log(err);

    if (err instanceof ValidationError) {
      throw err;
    }
    throw new InternalError();
  }
}

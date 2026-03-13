import { createStore } from "zustand/vanilla";
import { devtools } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import {
  type ActiveIdentity,
  type AuthenticationResult,
  type Identity,
  type Username,
} from "@cavok/core/contracts/auth.contracts";

import { useStore } from "zustand";
import { refreshSession } from "../api/auth-queries";


type AuthStore = {
  accessToken: string;
  accessTokenData: Identity | undefined;
  refreshToken: string | undefined;
  initialized: boolean;
  sessionId: string | undefined;
  username: Username;
  userId: string | undefined;

  actions: {
    setAccessToken: (accessToken: string | undefined) => void;
    setRefreshToken: (refreshToken: string | undefined) => void;
    setSessionId: (sessionId: string | undefined) => void;
    setUsername: (username: Username | undefined) => void;
    setUserId: (userId: string | undefined) => void;
    // set tokens on the app start
    initSession: () => Promise<boolean>;
    clearTokens: () => void;
    renewSession: (result: AuthenticationResult) => void;
  };
};

export const decodeAccessToken = (accessToken: string) => jwtDecode<ActiveIdentity>(accessToken);

const authStore = createStore<AuthStore>()(
  devtools(
    (set, get) => ({
      accessToken: "",
      accessTokenData: undefined,
      sessionId: undefined,
      userId: undefined,
      initialized: false,
      username: undefined,
      actions: {
        setUsername: (username: Username | undefined) => {
          set({
            username,
          });
        },
        setSessionId: (sessionId: string | undefined) => {
          set({
            sessionId,
          });
        },
        setUserId: (userId: string | undefined) => {
          set({
            userId,
          });
        },
        setAccessToken: (accessToken: string | undefined) => {
          const accessTokenData = (() => {
            try {
              return accessToken ? decodeAccessToken(accessToken) : undefined;
            } catch (error) {
              console.error(error);
              return undefined;
            }
          })();
          set({
            accessToken,
            accessTokenData,
            sessionId: accessTokenData?.sessionId as string,
            userId: accessTokenData?.userId as string,
          });
        },
        initSession: async () => {
          if (get().initialized) {
            return get().accessToken && get().accessTokenData;
          }

          const result = await refreshSession();

          set({
            initialized: true,
          });

          if (!result) {
            return false;
          }

          const accessToken = result.tokens.access_token;

          try {
            const data = decodeAccessToken(accessToken);

            set({
              accessToken,
              accessTokenData: data,
              sessionId: data?.sessionId as string,
              username: data?.username,
              userId: data?.userId as string,
            });

            return true;
          } catch (err) {
            return false;
          }
        },
        renewSession: (result: AuthenticationResult) => {
          const accessToken = result.tokens.access_token;

          try {
            const data = decodeAccessToken(accessToken);

            set({
              accessToken,
              accessTokenData: data,
              sessionId: data?.sessionId as string,
              username:data?.username,
              userId: data?.userId as string,
            });
          } catch (err) {
            console.error("Failed to decode access token:", err);
          }
        },
        clearTokens: () =>
          set({
            accessToken: undefined,
            accessTokenData: undefined,
            refreshToken: undefined,
          }),
      },
    }),
    {
      name: "auth-store",
      enabled: !import.meta.env.PROD,
    }
  )
);

/**
 * Required for zustand stores, as the lib doesn't expose this type
 */
export type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;

type Params<U> = Parameters<typeof useStore<typeof authStore, U>>;

// Selectors
const accessTokenSelector = (state: ExtractState<typeof authStore>) => state.accessToken;
const accessTokenDataSelector = (state: ExtractState<typeof authStore>) => state.accessTokenData;
const refreshTokenSelector = (state: ExtractState<typeof authStore>) => state.refreshToken;
const actionsSelector = (state: ExtractState<typeof authStore>) => state.actions;

const sessionIdSelector = (state: ExtractState<typeof authStore>) => state.sessionId;
const usernameSelector = (state: ExtractState<typeof authStore>) => state.username;
const userIdSelector = (state: ExtractState<typeof authStore>) => {
  if (!state.accessTokenData) {
    throw new Error("No access token data found");
  }
  return state.accessTokenData.userId;
};
// getters
export const getAccessToken = () => accessTokenSelector(authStore.getState());
export const getAccessTokenData = () => accessTokenDataSelector(authStore.getState());
export const getRefreshToken = () => refreshTokenSelector(authStore.getState());
export const getSessionId = () => sessionIdSelector(authStore.getState());
export const getActions = () => actionsSelector(authStore.getState());
export const getUsername = () => usernameSelector(authStore.getState());
export const getUserId = () => userIdSelector(authStore.getState());

function useAuthStore<U>(selector: Params<U>[1]) {
  return useStore(authStore, selector);
}

// Hooks
export const useAccessToken = () => useAuthStore(accessTokenSelector);
export const useAccessTokenData = () => useAuthStore(accessTokenDataSelector);
export const useRefreshToken = () => useAuthStore(refreshTokenSelector);
export const useSessionId = () => useAuthStore(sessionIdSelector);
export const useActions = () => useAuthStore(actionsSelector);
export const useUsername = () => useAuthStore(usernameSelector);

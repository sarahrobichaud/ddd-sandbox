import { Context, DefaultState, DefaultContext } from "koa";
import { BaseException } from "#errors/base";
import { ActiveIdentity, Identity } from "@cavok/core/contracts/auth.contracts";

export interface SuccessResponse<T> {
  success: true;
  path: string;
  status: number;
  data: T;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  path: string;
  status: number;
  error: {
    code: number;
    message: string;
    cause: string;
  };
  timestamp: string;
}

export interface HorizonFSState extends DefaultState {
  requestId: string;
  requestStartTime: number;
  auth: {
    type: "cookie" | "body";
    refreshToken: string | null;
  };
  identity: ActiveIdentity | null;
}

export interface HttpContext extends DefaultContext {
  requestId: string;
}

export type AppContext = Context & {
  state: HorizonFSState;
} & HttpContext;

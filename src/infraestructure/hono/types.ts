import { type Context as HContext, Hono as HHono } from "hono";
import type { ResultError } from "../../shared/Result";
import type { IAuthRepository } from "../web3auth/ports/IAuthRepository";

export type Hono = HHono<{
  Variables: ContextVariables;
}>;
export type Context = HContext<{
  Variables: ContextVariables;
}>;

export type HonoServiceDependencies = {
  repositories: {
    web3auth: IAuthRepository;
  };
};

export interface ContextVariables {
  // Repositories
  "repositories:web3auth": HonoServiceDependencies['repositories']["web3auth"];

  // Entities
  "request:body": unknown;
}

interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}
interface ErrorResponse {
  success: false;
  error: ResultError;
}
export type HandlerResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

export type HttpMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
export type RouteSchema = {
  method: HttpMethod;
  id: string;
  url: string;
};
export type RouteHandler = (c: Context) => Response | Promise<Response>;
export type BrokerHandler = (
  c: Context
) => SyncResult<Context> | AsyncResult<Context>;

export type Route = {
  schema: RouteSchema;
  handler: RouteHandler;
};

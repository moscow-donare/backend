import { type Context as HContext, Hono as HHono } from "hono";
import type { ResultError } from "../../shared/Result";
import type { IAuthRepository } from "../repositories/web3auth/ports/IAuthRepository";
import type { IUserRepository } from "$core/users/domain/ports/IUserRepository";
import type { User } from "$core/users/domain/user";

export type Hono = HHono<{
  Variables: ContextVariables;
}>;
export type Context = HContext<{
  Variables: ContextVariables;
}>;

export type HonoServiceDependencies = {
  repositories: {
    web3auth: IAuthRepository;
    user: IUserRepository;
  };
};

export interface ContextVariables {
  // Repositories
  "repositories:web3auth": HonoServiceDependencies['repositories']["web3auth"];
  "repositories:user": HonoServiceDependencies['repositories']["user"];

  // Entities
  "user:session": User; 
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

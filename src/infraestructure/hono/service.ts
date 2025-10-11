import { Hono as HHono } from "hono";
import { cors } from "hono/cors";
import type { Hono, HonoServiceDependencies } from "./types";

import HonoRouter from "./router";
import routes from "./routes";

class HonoService {
  private app: Hono;
  private router: HonoRouter;

  public get honoApp() {
    return this.app;
  }

  constructor(deps: HonoServiceDependencies) {
    this.app = new HHono();
    this.router = new HonoRouter(this.app);

    /**
     * Use an strict cors config only for production.
     * On other envs, enable all.
     */
    this.app.use(
      "*",
      cors(
        process.env.NODE_ENV === "production"
          ? {
            origin: [
              // == Stable
              "http://localhost:3000",
            ],
            allowHeaders: [
              "Upgrade-Insecure-Requests",
              "Authorization",
              "Content-Type",
            ],
            allowMethods: ["POST", "GET", "OPTIONS", "PATCH", "PUT"],
            exposeHeaders: ["Content-Length"],
            maxAge: 600,
            credentials: true,
          }
          : undefined
      )
    );

    // Dependency Injection
    this.app.use((c, next) => {
      c.set("repositories:web3auth", deps.repositories.web3auth);
      c.set("repositories:user", deps.repositories.user);
      c.set("repositories:userData", deps.repositories.userData);
      c.set("repositories:campaign", deps.repositories.campaign);
      return next();
    });

    for (const r of routes) {
      this.router.push(r.schema, r.handler);
    }
  }

  public get fetch() {
    return this.app.fetch;
  }
}

export default HonoService;

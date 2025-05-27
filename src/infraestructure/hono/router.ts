import type { Hono, RouteSchema, RouteHandler, BrokerHandler } from "./types";

class HonoRouter {
  private schemap: Map<string, RouteSchema>;
  private hono: Hono;

  constructor(hono: Hono) {
    this.schemap = new Map();
    this.hono = hono;
  }

  public get routes(): RouteSchema[] {
    return Array.from(this.schemap.values());
  }

  public push(schema: RouteSchema, handler: RouteHandler) {
    this.schemap.set(schema.id, schema);

    const honoRegisterFn = {
      GET: this.hono.get,
      POST: this.hono.post,
      DELETE: this.hono.delete,
      PUT: this.hono.put,
      PATCH: this.hono.patch,
    }[schema.method];
    honoRegisterFn(schema.url, handler);
  }

  public get(id: string) {
    return this.schemap.get(id);
  }

  public static resolve(
    tail: RouteHandler,
    brokers: BrokerHandler[] = []
  ): RouteHandler {
    const handler: RouteHandler = async (c) => {
      let ctx = c;

      for (const b of brokers) {
        const bResult = await b(ctx);
        if (bResult.isErr) {
          return c.json({
            success: false,
            error: {
              code: bResult.error.code,
              message: bResult.error.message,
              details: bResult.error.details,
            },
          });
        }
        ctx = bResult.value;
      }

      return tail(c);
    };

    return handler;
  }

  public toString(): string {
    let output = "HonoRouter {";

    const max = {
      id: 0,
      method: 0,
      url: 0,
    };
    this.routes.forEach((r) => {
      if (r.id.length > max.id) max.id = r.id.length;
      if (r.method.length > max.method) max.method = r.method.length;
      if (r.url.length > max.url) max.url = r.url.length;
    });

    this.routes.forEach((r) => {
      output += "\n".padEnd(5, " ");
      output += `(${r.id})`.padEnd(max.id + 4);
      output += `[${r.method}]`.padEnd(max.method + 4);
      output += `${r.url}`.padEnd(max.url + 4);
    });

    output += "\n}";
    return output;
  }
}

export default HonoRouter;

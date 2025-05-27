import getHelloWorldHandler from "./handlers/getHelloWorld";
import type { Route } from "./types";

const routes: Route[] = [
  {
    handler: getHelloWorldHandler,
    schema: {
      method: "GET",
      id: "getHelloWorld",
      url: "/hello-world",
    },
  },
];

export default routes;

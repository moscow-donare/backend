import getHelloWorldHandler from "./handlers/getHelloWorld";
import loginWeb3AuthHandler from "./handlers/auth/loginWeb3Auth"
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

  //Login Web3Auth
  {
    handler: loginWeb3AuthHandler,
    schema: {
      method: "POST",
      id: "loginWeb3Auth",
      url: "/auth/web3"
    }
  }
];

export default routes;

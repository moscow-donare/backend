import getHelloWorldHandler from "./handlers/getHelloWorld";
import loginWeb3AuthHandler from "./handlers/auth/loginWeb3Auth"
import type { Route } from "./types";
import createCampaignHandler from "./handlers/campaigns/createCampaignHandler";
import getCampaignHandler from "./handlers/campaigns/getCampaignHandler";
import getCampaignsOfUserHandler from "./handlers/campaigns/getCampaignsOfUser";

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
  },
  //Create Campaign
  {
    handler: createCampaignHandler,
    schema: {
      method: "POST",
      id: "createCampaign",
      url: "/campaigns/create"
    }
  },
  {
    schema: {
      id: "getCampaignByCriteria",
      url: "/campaigns/criteria",
      method: "GET",
    },
    handler: getCampaignsOfUserHandler
  }
];

export default routes;

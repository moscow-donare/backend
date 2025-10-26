import getHelloWorldHandler from "./handlers/getHelloWorld";
import loginWeb3AuthHandler from "./handlers/auth/loginWeb3Auth"
import type { Route } from "./types";
import createCampaignHandler from "./handlers/campaigns/createCampaignHandler";
import getCampaignsOfUserHandler from "./handlers/campaigns/getCampaignsOfUser";
import editCampaignHandler from "./handlers/campaigns/editCampaign";
import getCampaignByIdPublicHandler from "./handlers/campaigns/getCampaignByIdPublicHandler";
import approveCampaignHandler from "./handlers/campaigns/approveCampaign";
import getCampaignsInReviewHandler from "./handlers/campaigns/getCampigsInReview";
import cancelCampaignHandler from "./handlers/campaigns/cancelCampaign";
import getCampaignsActiveHandler from "./handlers/campaigns/getCampaignsActive";
import requestCampaignChangesHandler from "./handlers/campaigns/requestCampaignChanges";

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
      url: "/campaigns/creator/criteria",
      method: "GET",
    },
    handler: getCampaignsOfUserHandler
  },
  {
    handler: editCampaignHandler,
    schema: {
      id: "editCampaign",
      url: "/campaigns/edit/:id",
      method: "PATCH",
    }
  },
  // public endpoints campaign
  {
    handler: getCampaignByIdPublicHandler,
    schema: {
      id: "getCampaignByIdPublic",
      url: "/campaigns/id/:id",
      method: "GET",
    }
  },
  {
    handler: cancelCampaignHandler,
    schema: {
      id: "cancelCampaign",
      url: "/campaigns/cancel",
      method: "PATCH",
    }
  },
  {
    handler: requestCampaignChangesHandler,
    schema: {
      id: "requestCampaignChanges",
      url: "/backoffice/campaigns/request-changes",
      method: "PATCH",
    }
  },
  // approve campaign 
  {
    handler: approveCampaignHandler,
    schema: {
      id: "approveCampaign",
      url: "/backoffice/campaigns/approve",
      method: "PATCH",
    }
  },
  // get campaigns in review  
  {
    handler: getCampaignsInReviewHandler,
    schema: {
      id: "getCampaignsInReview",
      url: "/backoffice/campaigns/in-review",
      method: "GET",
    }
  },
  {
    handler: getCampaignsActiveHandler,
    schema: {
      id: "getCampaignsActive",
      url: "/campaigns/active",
      method: "GET",
    }
  }
];

export default routes;

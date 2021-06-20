import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider("", 1);

const fleekAuth = {
  apiKey: process.env.FLEEK_API_KEY,
  apiSecret: process.env.FLEEK_API_SECRET,
};

const fleekGamesAuth = {
  ...fleekAuth,
  key: "daochess-games",
};

export { provider, fleekAuth, fleekGamesAuth };

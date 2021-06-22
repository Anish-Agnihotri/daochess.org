import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider(
  process.env.ARCHIVE_NODE,
  1
);

const fleekAuth = {
  apiKey: process.env.FLEEK_API_KEY,
  apiSecret: process.env.FLEEK_API_SECRET,
};

const fleekGamesAuth = {
  ...fleekAuth,
  key: "daochess-games",
};

export { provider, fleekAuth, fleekGamesAuth };

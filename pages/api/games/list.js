import fleekStorage from "@fleekhq/fleek-storage-js";
import { fleekGamesAuth } from "utils/ethers";

export default async (req, res) => {
  let games;
  try {
    const gamesRaw = await fleekStorage.get({
      ...fleekGamesAuth,
      getOptions: ["data"],
    });
    games = JSON.parse(gamesRaw.data.toString());
  } catch {
    games = [];
  }

  res.send(games);
};

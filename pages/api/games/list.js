import { fleekGamesAuth } from "utils/ethers"; // Auth object
import fleekStorage from "@fleekhq/fleek-storage-js"; // Fleek

export default async (req, res) => {
  let games; // Setup games array

  try {
    // Collect games from fleek
    const gamesRaw = await fleekStorage.get({
      ...fleekGamesAuth,
      getOptions: ["data"],
    });
    // Parse games to object
    games = JSON.parse(gamesRaw.data.toString());
  } catch {
    // If error, make games empty array
    games = [];
  }

  // Return games
  res.send(games);
};

import { fleekAuth } from "utils/ethers"; // Auth object
import fleekStorage from "@fleekhq/fleek-storage-js"; // Fleek

/**
 * Collect a game by id
 * @param {String} id uuid of game to collect
 * @returns {Object || Null} game or null
 */
export const collectGameById = async (id) => {
  let game; // Setup game

  try {
    // Collect game by id key
    const gameRaw = await fleekStorage.get({
      ...fleekAuth,
      key: id,
      getOptions: ["data"],
    });
    // Parse game data to JSON object
    game = JSON.parse(gameRaw.data.toString());
  } catch {
    // If error, force game to null
    game = null;
  }

  return game;
};

export default async (req, res) => {
  const { id } = req.body;
  // Collect game by id param
  return res.send(await collectGameById(id));
};

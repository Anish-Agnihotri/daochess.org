import { ethers } from "ethers"; // Ethers
import { v4 as uuidv4 } from "uuid"; // uuid generation
import fleekStorage from "@fleekhq/fleek-storage-js"; // Fleek
import { provider, fleekAuth, fleekGamesAuth } from "utils/ethers"; // jsonrpcprovider, fleek auth

// Default Chess starting position
const FEN_STARTING_POSITION =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default async (req, res) => {
  // Collect required params from body
  const {
    dao1Name,
    dao1Address,
    dao1Decimals,
    dao2Name,
    dao2Address,
    dao2Decimals,
    timeout,
  } = req.body;

  // Check for missing parameters
  if (
    !dao1Name ||
    !dao1Address ||
    !dao1Decimals ||
    !dao2Name ||
    !dao2Address ||
    !dao2Decimals ||
    !timeout
  ) {
    return res.status(500).send({ error: "Incorrect parameters provided." });
  }

  // Check for proper address formats
  if (
    !ethers.utils.isAddress(dao1Address) ||
    !ethers.utils.isAddress(dao2Address)
  ) {
    return res.status(500).send({ error: "Incorrect addresses provided." });
  }

  // Check decimal format is correct
  const dao1DecimalsInt = parseInt(dao1Decimals);
  const dao2DecimalsInt = parseInt(dao2Decimals);
  if (
    dao1DecimalsInt > 18 ||
    dao1DecimalsInt < 0 ||
    dao2DecimalsInt > 18 ||
    dao2DecimalsInt < 0
  ) {
    return res.status(500).send({ error: "Incompatible decimal format." });
  }

  // Check for existing game
  let games = []; // Existing games
  let gameExists = false;

  try {
    // Collect all games
    const gamesRaw = await fleekStorage.get({
      ...fleekGamesAuth,
      getOptions: ["data"],
    });
    // Parse games
    games = JSON.parse(gamesRaw.data.toString());

    // For each game
    for (const game of games) {
      // If game addresses match
      if (
        (game.dao1.address.toLowerCase() === dao1Address.toLowerCase() &&
          game.dao2.address.toLowerCase() === dao2Address.toLowerCase()) ||
        (game.dao1.address.toLowerCase() === dao2Address.toLowerCase() &&
          game.dao2.address.toLowerCase() === dao1Address.toLowerCase())
      ) {
        // Toggle that game already exists
        gameExists = true;
      }
    }
  } catch {
    // Else, simply force game exists to false
    gameExists = false; // TODO: ensure doesnt cause array overwrite on fleek failure
  }

  // Check if game already exists
  if (gameExists) {
    return res.status(500).send({ error: "Game already exists between DAOs." });
  }

  // Else, setup game parameters
  const white = Math.round(Math.random());
  const snapshot_block = await provider.getBlockNumber();
  const game_id = uuidv4();
  const generalGameDetails = {
    id: game_id,
    dao1: {
      name: dao1Name,
      address: dao1Address,
      decimals: dao1DecimalsInt,
      white: white === 0,
    },
    dao2: {
      name: dao2Name,
      address: dao2Address,
      decimals: dao2DecimalsInt,
      white: white === 1,
    },
    timeout,
    snapshot_block: snapshot_block,
    snapshot_timestamp: Math.round(Date.now() / 1000),
    white,
  };

  // Upload new game details to overall dao-list
  try {
    await fleekStorage.upload({
      ...fleekGamesAuth,
      data: JSON.stringify([generalGameDetails, ...games]),
    });
  } catch {
    return res
      .status(500)
      .send({ error: "Failed to update list of daogames." });
  }

  // Upload new game JSON file
  try {
    await fleekStorage.upload({
      ...fleekAuth,
      key: game_id,
      data: JSON.stringify({
        ...generalGameDetails,
        move: 0,
        turn_over:
          generalGameDetails.snapshot_timestamp + parseInt(timeout) * 60,
        fen: FEN_STARTING_POSITION,
        current: {
          proposed_moves: [],
          voters: [],
        },
        historic_moves: [],
      }),
    });
    return res.status(200).send({ id: game_id });
  } catch {
    return res.status(500).send({ error: "Failed to create game state." });
  }
};

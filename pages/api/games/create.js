import { ethers } from "ethers";
import { v4 as uuidv4 } from "uuid";
import fleekStorage from "@fleekhq/fleek-storage-js";
import { provider, fleekAuth, fleekGamesAuth } from "utils/ethers";

const FEN_STARTING_POSITION =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default async (req, res) => {
  const { dao1Name, dao1Address, dao2Name, dao2Address, timeout } = req.body;

  if (!dao1Name || !dao1Address || !dao2Name || !dao2Address || !timeout) {
    res.status(500).send({ error: "Incorrect parameters provided." });
  } else if (
    !ethers.utils.isAddress(dao1Address) ||
    !ethers.utils.isAddress(dao2Address)
  ) {
    res.status(500).send({ error: "Incorrect addresses provided." });
  } else {
    let games = [];
    let gameExists = false;
    try {
      const gamesRaw = await fleekStorage.get({
        ...fleekGamesAuth,
        getOptions: ["data"],
      });
      games = JSON.parse(gamesRaw.data.toString());

      for (const game of games) {
        if (
          (game.dao1.address.toLowerCase() === dao1Address.toLowerCase() &&
            game.dao2.address.toLowerCase() === dao2Address.toLowerCase()) ||
          (game.dao1.address.toLowerCase() === dao2Address.toLowerCase() &&
            game.dao2.address.toLowerCase() === dao1Address.toLowerCase())
        ) {
          gameExists = true;
        }
      }
    } catch {
      gameExists = false;
    }

    if (gameExists) {
      res.status(500).send({ error: "Game already exists between DAOs." });
    } else {
      const white = Math.round(Math.random());
      const snapshot_block = await provider.getBlockNumber();
      const game_id = uuidv4();
      const generalGameDetails = {
        id: game_id,
        dao1: {
          name: dao1Name,
          address: dao1Address,
          white: white === 0,
        },
        dao2: {
          name: dao2Name,
          address: dao2Address,
          white: white === 1,
        },
        timeout,
        snapshot_block: snapshot_block,
        snapshot_timestamp: Math.round(Date.now() / 1000),
        white,
      };

      await fleekStorage.upload({
        ...fleekGamesAuth,
        data: JSON.stringify([generalGameDetails, ...games]),
      });

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

      res.status(200).send({ id: game_id });
    }
  }
};

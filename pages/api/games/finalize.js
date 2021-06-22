import { Chess } from "chess.js"; // Chess validation engine
import { fleekAuth } from "utils/ethers"; // Fleek auth object
import { collectGameById } from "./collect"; // Collection helper
import fleekStorage from "@fleekhq/fleek-storage-js"; // Fleek

export default async (req, res) => {
  // Collect required parameters
  const { id } = req.body;

  // Check if parameters exist
  if (!id) {
    res.status(500).send({ error: "Missing parameters." });
  }

  // Check if game exists
  const game = await collectGameById(id);
  if (!game) {
    res.status(500).send({ error: "Game does not exist. " });
  }

  // Check if at least 1 proposal is present
  if (game.current.proposed_moves.length < 1) {
    res
      .status(500)
      .send({ error: "Must submit a move proposal before finalizing." });
  }

  // Check if the turn timeout is up
  if (Math.round(Date.now() / 1000) <= game.turn_over) {
    res.status(500).send({
      error: "Turn is not yet over. Cannot finalize till turn timeout.",
    });
  }

  // FIXME: fix randomization if tie between top voted option
  const sortedProposedMoves = game.current.proposed_moves.sort(
    (a, b) => a.votes - b.votes
  );
  // Collect best move
  const bestProposedMove = sortedProposedMoves[sortedProposedMoves.length - 1];

  // Update game details based on best move
  let newGame = game;
  newGame.move++;
  newGame.turn_over = Math.round(Date.now() / 1000) + 60 * game.timeout;
  // Collect new fen based on move emulation
  const board = new Chess(game.fen);
  board.move(bestProposedMove.move, { sloppy: true });
  newGame.fen = board.fen();
  // Reset current move
  newGame.current.proposed_moves = [];
  newGame.current.voters = [];

  const playingTeam =
    game.move % 2 === 0
      ? game.white === 0
        ? game.dao1
        : game.dao2
      : game.white === 0
      ? game.dao2
      : game.dao1;
  // Push new move to historic moves
  newGame.historic_moves.push({
    team: playingTeam.name,
    timestamp: bestProposedMove.timestamp,
    proposer: bestProposedMove.proposer,
    votes: bestProposedMove.votes,
    move: bestProposedMove.move,
  });

  try {
    // Upload new game details
    await fleekStorage.upload({
      ...fleekAuth,
      key: game.id,
      data: JSON.stringify(newGame),
    });
    res.status(200).send({ message: "Finalized turn.", game: newGame });
  } catch {
    res.status(500).send({ error: "Unexpected error when finalizing turn." });
  }
};

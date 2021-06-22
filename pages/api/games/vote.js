import { Chess } from "chess.js"; // Chess validation engine
import { fleekAuth } from "utils/ethers"; // Fleek auth object
import { collectGameById } from "./collect"; // Collection helper
import fleekStorage from "@fleekhq/fleek-storage-js"; // Fleek
import { collectVotesForToken } from "../votes/count"; // Collection helper
import { recoverPersonalSignature } from "eth-sig-util"; // ETH sig utils

// FIXME: can refactor edited game uploads into 1 push instead of two via if/else

export default async (req, res) => {
  // Collect required parameters
  const { id, move, address, sig } = req.body;

  // Check that all parameters are provided
  if (!id || !move || !address || !sig) {
    return res
      .status(500)
      .send({ error: "Missing required parameters or not authenticated." });
  }

  // Check if game exists
  const game = await collectGameById(id);
  if (!game) {
    return res.status(500).send({ error: "Game does not exist. " });
  }

  // Check if fen move would be valid
  const currentBoard = new Chess(game.fen);
  if (!currentBoard.move(move, { sloppy: true })) {
    return res.status(500).send({ error: "Illegal move." });
  }

  // Check if signature matches with fen + address
  const decodedAddress = recoverPersonalSignature({ data: move, sig: sig });
  console.log(decodedAddress);
  if (address.toLowerCase() !== decodedAddress.toLowerCase()) {
    return res.status(500).send({ error: "Incorrect signature." });
  }

  // Check if address has balance to vote for current team
  const playingTeam =
    game.move % 2 === 0
      ? game.white === 0
        ? game.dao1
        : game.dao2
      : game.white === 0
      ? game.dao2
      : game.dao1;
  const votes = await collectVotesForToken(
    address,
    playingTeam.address,
    playingTeam.decimals,
    game.snapshot_block
  );
  if (votes <= 0) {
    return res.status(500).send({
      error: `Address has 0 voting power at block ${game.snapshot_block}.`,
    });
  }

  // Check if address has already voted
  const voters = game.current.voters.map((e) => e.voter);
  if (voters.includes(address.toLowerCase())) {
    return res
      .status(500)
      .send({ error: "Address has already placed vote this turn." });
  }

  // Check if turn time is over and proposal count > 0; if so, prompt finalization
  const current_timestamp = Math.round(Date.now() / 1000);
  if (current_timestamp >= game.turn_over && voters.length > 0) {
    return res.status(500).send({
      error: "Turn time is over with existing proposals. Call finalize. ",
    });
  }

  // Check if vote for move already exists, if so increment vote
  let newGame = game;
  const proposed_moves = game.current.proposed_moves.map((m) => m.move);
  if (proposed_moves.includes(move.toLowerCase())) {
    // Map each move
    newGame.current.proposed_moves.map((m) => {
      // If move matches
      if (m.move === move.toLowerCase()) {
        // Increment vote
        m.votes += votes;

        // Push new voter
        newGame.current.voters.push({
          timestamp: Math.round(Date.now() / 1000),
          voter: address.toLowerCase(),
          move: move.toLowerCase(),
        });
      }

      return m;
    });

    try {
      // Upload edited game details
      await fleekStorage.upload({
        ...fleekAuth,
        key: game.id,
        data: JSON.stringify(newGame),
      });
      return res.status(200).send({
        message: "Incremented existing move vote count.",
        game: newGame,
      });
    } catch {
      return res
        .status(500)
        .send({ error: "Unexpected error when adding vote." });
    }
  } else {
    // If move does not exist, create move and vote
    newGame.current.proposed_moves.push({
      timestamp: Math.round(Date.now() / 1000),
      proposer: address.toLowerCase(),
      move: move.toLowerCase(),
      votes: votes,
    });

    // Push new voter to array
    newGame.current.voters.push({
      timestamp: Math.round(Date.now() / 1000),
      voter: address.toLowerCase(),
      move: move.toLowerCase(),
    });

    try {
      // Upload edited game details
      await fleekStorage.upload({
        ...fleekAuth,
        key: game.id,
        data: JSON.stringify(newGame),
      });
      return res
        .status(200)
        .send({ message: "Added new move proposal.", game: newGame });
    } catch {
      return res
        .status(500)
        .send({ error: "Unexpected error when adding move proposal." });
    }
  }
};

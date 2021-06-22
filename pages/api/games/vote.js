import { collectVotesForToken } from "../votes/count";
import { collectGameById } from "./collect";
import fleekStorage from "@fleekhq/fleek-storage-js";
import { fleekAuth } from "utils/ethers";

export default async (req, res) => {
  const { id, fen, address, sig } = req.body;

  // Check that all parameters are provided
  if (!id || !fen || !address || !sig) {
    res
      .status(500)
      .send({ error: "Missing required parameters or not authenticated." });
  }

  // Check if game exists
  const game = await collectGameById(id);
  if (!game) {
    res.status(500).send({ error: "Game does not exist. " });
  }

  // Check if fen move would be valid

  // Check if signature matches with fen + address

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
    game.snapshot_block
  );
  if (votes <= 0) {
    res.status(500).send({
      error: `Address has 0 voting power at block ${game.snapshot_block}.`,
    });
  }

  // Check if address has already voted
  const voters = game.current.voters.map((e) => e.voter);
  if (voters.includes(address.toLowerCase())) {
    res
      .status(500)
      .send({ error: "Address has already placed vote this turn." });
  }

  // Check if turn time is over and proposal count > 0; if so, prompt finalization
  const current_timestamp = Math.round(Date.now() / 1000);
  if (current_timestamp >= game.turn_over && voters.length > 0) {
    res.status(500).send({
      error: "Turn time is over with existing proposals. Call finalize. ",
    });
  }

  // Check if vote for move already exists, if so increment vote
  let newGame = game;
  const proposed_moves = game.current.proposed_moves.map((m) => m.move);
  if (proposed_moves.includes(fen.toLowerCase())) {
    newGame.current.proposed_moves.map((m) => {
      if (m.move === fen.toLowerCase()) {
        m.votes += votes;

        newGame.current.voters.push({
          timestamp: Math.round(Date.now() / 1000),
          voter: address.toLowerCase(),
          move: fen.toLowerCase(),
        });
      }

      return m;
    });

    try {
      await fleekStorage.upload({
        ...fleekAuth,
        key: game.id,
        data: JSON.stringify(newGame),
      });
      res
        .status(200)
        .send({ message: "Incremented existing move vote count." });
    } catch {
      res.status(500).send({ error: "Unexpected error when adding vote." });
    }
  } else {
    // If move does not exist, create move and vote
    newGame.current.proposed_moves.push({
      timestamp: Math.round(Date.now() / 1000),
      proposer: address.toLowerCase(),
      move: fen.toLowerCase(),
      votes: votes,
    });

    newGame.current.voters.push({
      timestamp: Math.round(Date.now() / 1000),
      voter: address.toLowerCase(),
      move: fen.toLowerCase(),
    });

    try {
      await fleekStorage.upload({
        ...fleekAuth,
        key: game.id,
        data: JSON.stringify(newGame),
      });
      res
        .status(200)
        .send({ message: "Added new move proposal.", game: newGame });
    } catch {
      res
        .status(500)
        .send({ error: "Unexpected error when adding move proposal." });
    }
  }
};

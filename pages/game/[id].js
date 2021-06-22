import Layout from "components/layout";
import { collectGameById } from "pages/api/games/collect";
import styles from "styles/pages/Chess.module.scss";
import dynamic from "next/dynamic";
import eth from "@state/eth";
import { useState, useEffect } from "react";
import ReactTable from "react-table-6";
import axios from "axios";
import { bufferToHex } from "ethereumjs-util";

const Chessboard = dynamic(() => import("chessboardjsx"), { ssr: false });

export default function Game({ game: retrievedGame }) {
  const [game, setGame] = useState(retrievedGame);
  const [votes, setVotes] = useState(null);
  const [newMove, setNewMove] = useState("");
  const [loading, setLoading] = useState(false);
  const { provider, rawAddress } = eth.useContainer();

  // Utility methods
  const isAuthed = !!rawAddress;
  const playingTeam =
    game.move % 2 === 0
      ? game.white === 0
        ? game.dao1
        : game.dao2
      : game.white === 0
      ? game.dao2
      : game.dao1;
  const votingPeriod = game.turn_over > Math.round(Date.now() / 1000);
  const proposalsExist = game.current.proposed_moves.length > 0;
  const hasVoted = isAuthed
    ? game.current.voters.filter(
        (e) => e.voter.toLowerCase() === rawAddress.toLowerCase()
      ).length > 0
      ? true
      : false
    : false;

  const checkAddressVotes = async () => {
    if (isAuthed) {
      setLoading(true);
      try {
        const response = await axios.post("/api/votes/count", {
          address: rawAddress,
          token: playingTeam.address,
          block: game.snapshot_block,
        });
        setVotes(response.data.votes);
      } catch {
        console.log("Error when collecting address votes");
      }
      setLoading(false);
    } else {
      setVotes(null);
    }
  };

  const submitVote = async () => {
    let signature;
    try {
      const msg = bufferToHex(Buffer.from(newMove, "utf8"));
      signature = await provider.send("personal_sign", [msg, rawAddress]);
    } catch (error) {
      console.log(error);
    }

    console.log(signature);
    if (signature) {
      try {
        const response = await axios.post("/api/games/vote", {
          id: game.id,
          move: newMove,
          address: rawAddress,
          sig: signature,
        });
        setGame(response.data.game);
      } catch (error) {
        console.log(error.response.data.error);
      }
    }
  };

  const finalizeTurn = async () => {
    try {
      const response = await axios.post("/api/games/finalize", {
        id: game.id,
      });
      setGame(response.data.game);
    } catch (error) {
      console.log(error.response.data.error);
    }
  };

  useEffect(checkAddressVotes, [rawAddress]);

  return (
    <Layout>
      <div>
        <div className={styles.chess__title}>
          <h3>
            <span>
              <img
                height="50"
                width="50"
                src={game.dao1.white ? "/white.png" : "/black.png"}
                alt="Color"
              />{" "}
              {game.dao1.name}
            </span>{" "}
            vs
            <span>
              <img
                height="50"
                width="50"
                src={game.dao2.white ? "/white.png" : "/black.png"}
                alt="Color"
              />{" "}
              {game.dao2.name}
            </span>
          </h3>
        </div>

        <div className={styles.chess__board}>
          <div className="sizer">
            <Chess fen={game.fen} />
          </div>
        </div>

        <div className={styles.chess__details}>
          <div className="sizer">
            <h3>General Details</h3>
            <div className={styles.chess__details_card}>
              <div>
                <h4>Turn #</h4>
                <span>{game.move}</span>
              </div>
              <div>
                <h4>Playing DAO</h4>
                <span>{playingTeam.name}</span>
              </div>
              <div>
                <h4>Token balance snapshot</h4>
                <span>{game.snapshot_block}</span>
              </div>
              <div>
                <h4>Minutes to timeout</h4>
                <span>{game.turn_over}</span>
              </div>
            </div>

            <h3>User details</h3>
            {isAuthed ? (
              <div className={styles.chess__details_card}>
                <span>Votes at snapshot: {loading ? "Loading" : votes}</span>
                <span>New Move</span>
                {Math.round(Date.now() / 1000) > game.turn_over &&
                game.current.proposed_moves.length > 0 ? (
                  <>
                    <button onClick={finalizeTurn}>Finalize turn</button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={newMove}
                      onChange={(e) => setNewMove(e.target.value)}
                    />
                    <button onClick={() => submitVote(newMove)}>Submit</button>
                  </>
                )}
              </div>
            ) : (
              <div className={styles.chess__details_card}>
                <span className={styles.empty__table}>
                  User not authenticated.
                </span>
              </div>
            )}

            <h3>Current Round Proposed Moves</h3>
            <ProposedMovesTable
              moves={game.current.proposed_moves}
              voteHandler={submitVote}
            />

            <h3>Current Round Voters</h3>
            <CurrentRoundVoters voters={game.current.voters} />

            <h3>Historic Moves</h3>

            <HistoricMovesTable moves={game.historic_moves} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Chess({ fen }) {
  return <Chessboard position={fen} width={400} />;
}

function ProposedMovesTable({ moves, voteHandler }) {
  const movesColumns = [
    { Header: "Timestamp", accessor: "timestamp" },
    { Header: "Proposer", accessor: "proposer" },
    { Header: "Move", accessor: "move" },
    { Header: "Votes", accessor: "votes" },
    {
      Header: "Vote",
      accessor: "move",
      Cell: (props) => (
        <button onClick={() => voteHandler(props.value)}>Vote</button>
      ),
    },
  ];

  return moves.length < 1 ? (
    <div className={styles.chess__details_card}>
      <span className={styles.empty__table}>No current round moves found.</span>
    </div>
  ) : (
    <ReactTable
      data={moves}
      columns={movesColumns}
      pageSize={moves.length}
      showPagination={false}
    />
  );
}

function CurrentRoundVoters({ voters }) {
  const votersColumns = [
    { Header: "Timestamp", accessor: "timestamp" },
    { Header: "Voter", accessor: "voter" },
    { Header: "move", accessor: "move" },
  ];

  return voters.length < 1 ? (
    <div className={styles.chess__details_card}>
      <span className={styles.empty__table}>
        No current round voters found.
      </span>
    </div>
  ) : (
    <ReactTable
      data={voters}
      columns={votersColumns}
      pageSize={voters.length}
      showPagination={false}
    />
  );
}

function HistoricMovesTable({ moves }) {
  const historicMovesColumns = [
    { Header: "Team", accessor: "white" },
    { Header: "Date", accessor: "timestamp" },
    { Header: "Proposer", accessor: "proposer" },
    { Header: "Votes", accessor: "votes" },
    { Header: "Move", accessor: "move" },
  ];

  return moves.length < 1 ? (
    <div className={styles.chess__details_card}>
      <span className={styles.empty__table}>No historic moves found.</span>
    </div>
  ) : (
    <ReactTable
      data={moves}
      columns={historicMovesColumns}
      pageSize={moves.length}
      showPagination={false}
    />
  );
}

export async function getServerSideProps({ params: { id } }) {
  const game = await collectGameById(id);

  return {
    props: {
      game,
    },
  };
}

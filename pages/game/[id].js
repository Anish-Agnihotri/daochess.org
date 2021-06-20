import Layout from "components/layout";
import { collectGameById } from "pages/api/games/collect";
import styles from "styles/pages/Chess.module.scss";
import dynamic from "next/dynamic";
import eth from "@state/eth";
import { useState, useEffect } from "react";
import ReactTable from "react-table-6";
import axios from "axios";

const Chessboard = dynamic(() => import("chessboardjsx"), { ssr: false });

export default function Game({ game }) {
  const [votes, setVotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const { rawAddress } = eth.useContainer();

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
  console.log("Proposals Exist: ", proposalsExist);
  console.log("Has voted: ", hasVoted);

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

  useEffect(checkAddressVotes, [rawAddress]);

  return (
    <Layout>
      <div className={styles.chess}>
        <div className={styles.chess__board}>
          <div className="sizer">
            <Chess fen={game.fen} />
          </div>
        </div>

        <div className={styles.chess__details}>
          <div className="sizer">
            <div className={styles.chess__details_card}>
              <span>Votes at snapshot: {loading ? "Loading" : votes}</span>
            </div>

            <span>Game {JSON.stringify(game)}</span>

            <div className={styles.chess__details_card}>
              <ProposedMovesTable
                moves={game.current.proposed_moves}
                vote={() => console.log("Vote")}
              />
            </div>

            <div className={styles.chess__details_card}>
              <CurrentRoundVotes votes={game.current.votes} />
            </div>

            <div className={styles.chess__details_card}>
              <HistoricMovesTable moves={game.historic_moves} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Chess({ fen }) {
  return <Chessboard position={fen} width={400} />;
}

function ProposedMovesTable({ moves, vote }) {
  return <span>Proposed Moves</span>;
}

function CurrentRoundVotes({ votes }) {
  return <span>Votes</span>;
}

function HistoricMovesTable({ moves }) {
  const historicMovesColumns = [
    { Header: "Team", accessor: "white" },
    { Header: "Date", accessor: "timestamp" },
    { Header: "Proposer", accessor: "proposer" },
    { Header: "Votes", accessor: "votes" },
    { Header: "Move", accessor: "move" },
  ];

  return <ReactTable data={moves} columns={historicMovesColumns} />;
}

export async function getServerSideProps({ params: { id } }) {
  const game = await collectGameById(id);

  return {
    props: {
      game,
    },
  };
}
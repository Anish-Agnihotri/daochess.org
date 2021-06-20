import chess from "@state/chess";
import Layout from "components/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import Loader from "react-loader-spinner";
import styles from "styles/pages/Home.module.scss";
import ReactTable from "react-table-6";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const { getAllGames } = chess.useContainer();

  const getGamesWithLoading = async () => {
    setLoading(true);
    const retrievedGames = await getAllGames();
    setGames(retrievedGames);
    setLoading(false);
  };

  useEffect(getGamesWithLoading, []);

  /*
		Dao1
		Dao2
		Vote timeout
		Snapshot block
		Play
	 */
  const gameTableColumns = [
    /*Header: "DAO #1",
      accessor: "dao1",
      Cell: (props) => (
        <span>
          <img src="/logo.svg" alt="White" />
          <a
            href={`https://etherscan.io/address/${props.value.address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {props.value.name}
          </a>
        </span>
      ),*/
    {
      Header: "id",
      accessor: "id",
      Cell: (props) => <Link href={`/game/${props.value}`}>Play</Link>,
    },
  ];

  return (
    <Layout>
      <Capture />

      <div className="sizer">
        <div className={styles.home}>
          <h4>All Games</h4>

          <div className={styles.home__games}>
            {!loading ? (
              games.length > 0 ? (
                <ReactTable columns={gameTableColumns} data={games} />
              ) : (
                <div className={styles.home__games_empty}>
                  <span>No Games Found</span>
                </div>
              )
            ) : (
              <center>
                <Loader type="Oval" color="#007aff" height={50} width={50} />
              </center>
            )}
          </div>

          <Link href="/create">
            <a className={styles.home__create}>Create game</a>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

function Capture() {
  return (
    <div className={styles.home__capture}>
      <div className="sizer">
        <h3>Governance in action</h3>
        <p>
          daochess pits governance systems against each other in real-time games
          of Chess, testing mechanisms and coordination.
        </p>
      </div>
    </div>
  );
}

import Layout from "components/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import Loader from "react-loader-spinner";
import styles from "styles/pages/Home.module.scss";
import ReactTable from "react-table-6";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";

export default function Home() {
  const [games, setGames] = useState([]); // All daochess games
  const [loading, setLoading] = useState(true); // Loading page state

  /**
   * Collects and stores daochess games
   */
  const getGames = async () => {
    setLoading(true); // Toggle loading

    // Collect and store games
    try {
      const response = await axios.get("/api/games/list");
      setGames(response.data);
    } catch {
      toast.error("Error: could not collect games");
    }

    setLoading(false); // Toggle loading
  };

  // Collect games on page load
  useEffect(getGames, []);

  const gameTableColumns = [
    {
      Header: "DAO #1",
      accessor: "dao1",
      Cell: (props) => (
        <span className={styles.home__games_table_dao}>
          <img
            width="35"
            height="35"
            src={props.value.white ? "white.png" : "black.png"}
            alt={props.value.white ? "White" : "Black"}
          />
          <a
            href={`https://etherscan.io/address/${props.value.address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {props.value.name}
          </a>
        </span>
      ),
    },
    {
      Header: "DAO #2",
      accessor: "dao2",
      Cell: (props) => (
        <span className={styles.home__games_table_dao}>
          <img
            width="35"
            height="35"
            src={props.value.white ? "white.png" : "black.png"}
            alt={props.value.white ? "White" : "Black"}
          />
          <a
            href={`https://etherscan.io/address/${props.value.address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {props.value.name}
          </a>
        </span>
      ),
    },
    {
      Header: "Snapshot",
      accessor: "snapshot_timestamp",
      Cell: (props) => (
        <span>{dayjs.unix(props.value).format("MMMM D, YYYY (HH:mm)")}</span>
      ),
    },
    {
      Header: "Actions",
      accessor: "id",
      Cell: (props) => (
        <Link href={`/game/${props.value}`}>
          <a className={styles.home__games_table_play}>Play</a>
        </Link>
      ),
    },
  ];

  return (
    <Layout>
      <Capture />

      <div className="sizer">
        <div className={styles.home}>
          <h4>All Games</h4>

          {!loading ? (
            games.length > 0 ? (
              <ReactTable
                className={styles.home__games_table}
                columns={gameTableColumns}
                data={games}
                pageSize={games.length}
                showPagination={false}
              />
            ) : (
              <div className={styles.home__games}>
                <div className={styles.home__games_empty}>
                  <span>No Games Found</span>
                </div>
              </div>
            )
          ) : (
            <div className={styles.home__games}>
              <center>
                <Loader type="Oval" color="#007aff" height={50} width={50} />
              </center>
            </div>
          )}

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

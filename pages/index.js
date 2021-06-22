import dayjs from "dayjs"; // Date parsing
import axios from "axios"; // Requests
import Link from "next/link"; // Dynamic routing
import ReactTable from "react-table-6"; // Table
import Layout from "components/Layout"; // Component: layout
import { toast } from "react-toastify"; // Toast notifications
import Loader from "react-loader-spinner"; // Spinner
import { useEffect, useState } from "react"; // State management
import styles from "styles/pages/Home.module.scss"; // Page styles

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

  return (
    // Wrap page in layout
    <Layout>
      {/* Capture top CTA */}
      <Capture />

      <div className="sizer">
        <div className={styles.home}>
          <h4>All Games</h4>

          {!loading ? (
            // If games have been collected
            games.length > 0 ? (
              // If games exist, render games in table
              <ReactTable
                data={games}
                showPagination={false}
                pageSize={games.length}
                columns={gameTableColumns}
                className={`${styles.home__games_table} home__table`}
              />
            ) : (
              // Else, if no games exist, show empty state
              <div className={styles.home__games}>
                <div className={styles.home__games_empty}>
                  <span>No Games Found</span>
                </div>
              </div>
            )
          ) : (
            // Loading state while games are being collected
            <div className={styles.home__games}>
              <center>
                <Loader type="Oval" color="#007aff" height={50} width={50} />
              </center>
            </div>
          )}

          {/* Create game button */}
          <Link href="/create">
            <a className={styles.home__create}>Create game</a>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

/**
 * Capture top CTA
 * @returns {HTMLElement}
 */
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

// Columns for games table
const gameTableColumns = [
  // Redirect to game page
  {
    Header: "Actions",
    accessor: "id",
    Cell: (props) => (
      <Link href={`/game/${props.value}`}>
        <a className={styles.home__games_table_play}>Play</a>
      </Link>
    ),
  },
  // First DAO details
  {
    Header: "DAO #1",
    accessor: "dao1",
    Cell: (props) => (
      <span className={styles.home__games_table_dao}>
        {/* White or black turn */}
        <img
          width="35"
          height="35"
          src={props.value.white ? "images/white.png" : "images/black.png"}
          alt={props.value.white ? "White" : "Black"}
        />
        {/* Link to token */}
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
  // Second DAO details
  {
    Header: "DAO #2",
    accessor: "dao2",
    Cell: (props) => (
      <span className={styles.home__games_table_dao}>
        {/* White or black turn */}
        <img
          width="35"
          height="35"
          src={props.value.white ? "images/white.png" : "images/black.png"}
          alt={props.value.white ? "White" : "Black"}
        />
        {/* Link to token */}
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
  // Time of token holder snapshot
  {
    Header: "Snapshot",
    accessor: "snapshot_timestamp",
    Cell: (props) => (
      <span>{dayjs.unix(props.value).format("MMMM D, YYYY (HH:mm)")}</span>
    ),
  },
];

import dayjs from "dayjs"; // Date parsing
import axios from "axios"; // Requests
import state from "utils/state"; // Global state
import dynamic from "next/dynamic"; // Dynamic component import
import Layout from "components/layout"; // Component: Layout
import ReactTable from "react-table-6"; // React table
import { toast } from "react-toastify"; // Toast notifications
import { useState, useEffect } from "react"; // State management
import { bufferToHex } from "ethereumjs-util"; // eth utils
import styles from "styles/pages/Chess.module.scss"; // Component styles
import { collectGameById } from "pages/api/games/collect"; // Collection function

// Import Chessboard only client-side (requires window)
const Chessboard = dynamic(() => import("chessboardjsx"), { ssr: false });

export default function Game({ game: retrievedGame }) {
  // Local state
  const [votes, setVotes] = useState(null); // Votes for current token
  const [newMove, setNewMove] = useState(""); // Proposed new move
  const [loading, setLoading] = useState(false); // Vote loading state
  const [game, setGame] = useState(retrievedGame); // Game
  const [buttonLoading, setButtonLoading] = useState(false); // Button loading state

  // Global state
  const { provider, rawAddress } = state.useContainer();

  // Utility methods
  const isAuthed = !!rawAddress; // User is authenticated
  const playingTeam =
    game.move % 2 === 0
      ? game.white === 0
        ? game.dao1
        : game.dao2
      : game.white === 0
      ? game.dao2
      : game.dao1;
  const votingPeriod = game.turn_over > Math.round(Date.now() / 1000); // Voting is active
  const proposalsExist = game.current.proposed_moves.length > 0; // Proposals.length > 0

  /**
   * Checks authenticated address for vote count of playing team's token
   */
  const checkAddressVotes = async () => {
    // Check if authenticated
    if (isAuthed) {
      setLoading(true); // Toggle loading

      try {
        // Collect and set votes passing address, token, decimals, and block
        const response = await axios.post("/api/votes/count", {
          address: rawAddress,
          token: playingTeam.address,
          decimals: playingTeam.decimals,
          block: game.snapshot_block,
        });
        setVotes(response.data.votes);
      } catch {
        // If error, alert error
        toast.error("Error: could not collect address votes for token.");
      }

      setLoading(false); // Toggle loading
    } else {
      // If no authentication, force nullify votes
      setVotes(null);
    }
  };

  /**
   * Submit vote for a move
   */
  const submitVote = async (existingMove) => {
    setButtonLoading(true); // Toggle loading

    // Collect move to submit
    const selectedMove = existingMove ? existingMove : newMove;

    // Get signature
    let signature;
    try {
      // Collect msg buffer
      const msg = bufferToHex(Buffer.from(selectedMove, "utf8"));
      // Request signature from wallet
      signature = await provider.send("personal_sign", [msg, rawAddress]);
    } catch {
      // Throw error if user denied
      toast.error("Error: signing chess move failed.");
    }

    // If signature exists (double-check)
    if (signature) {
      // Post new vote
      try {
        const response = await axios.post("/api/games/vote", {
          id: game.id,
          move: selectedMove,
          address: rawAddress,
          sig: signature,
        });
        // Update game if successful
        setGame(response.data.game);
        // Toast success
        toast.success(`Successfully voted for move: ${selectedMove}`);
      } catch (error) {
        // Toast any errors
        toast.error(`Error: ${error.response.data.error}`);
      }
    }

    setButtonLoading(false); // Toggle loading
  };

  /**
   * Calls finalize for a team
   */
  const finalizeTurn = async () => {
    setButtonLoading(true); // Toggle loading

    // Call finalize
    try {
      // Call endpoint with id
      const response = await axios.post("/api/games/finalize", {
        id: game.id,
      });
      // Update game if successful
      setGame(response.data.game);
      // Toast success
      toast.success("Successfully finalized turn.");
    } catch (error) {
      // Toast any errors
      toast.error(`Error: ${error.response.data.error}`);
    }

    setButtonLoading(false); // Toggle loading
  };

  // Check votes on auth or game object change
  useEffect(checkAddressVotes, [rawAddress, game]);

  return (
    <Layout>
      {/* Competing DAOs title */}
      <div className={styles.chess__title}>
        <div className="sizer">
          <h3>
            {/* DAO #1 */}
            <span>
              <img
                height="25"
                width="25"
                src={
                  game.dao1.white ? "/images/white.png" : "/images/black.png"
                }
                alt="Color"
              />{" "}
              <span>{game.dao1.name}</span>
            </span>{" "}
            vs
            {/* DAO # 2*/}
            <span>
              <img
                height="25"
                width="25"
                src={
                  game.dao2.white ? "/images/white.png" : "/images/black.png"
                }
                alt="Color"
              />{" "}
              <span>{game.dao2.name}</span>
            </span>
          </h3>
        </div>
      </div>

      {/* Render chessboard and potential actions */}
      <div className={styles.chess__board}>
        <div className="sizer">
          <Chess fen={game.fen} />

          {/* Actions state machine */}
          {isAuthed ? (
            // Voting is still active
            votingPeriod ? (
              // Not loading votes
              !loading ? (
                // User votes > 0
                votes > 0 ? (
                  // Show voting
                  <div className={styles.chess__board_vote}>
                    <span>
                      You can vote with {votes} vote(s), this turn. To vote for
                      a move, enter its beginning and end position as one
                      string. For example, to move c2 to c4, enter "c2c4".
                    </span>
                    <input
                      type="text"
                      placeholder="c2c4"
                      value={newMove}
                      onChange={(e) => setNewMove(e.target.value)}
                    />
                    <button
                      onClick={() => submitVote(newMove)}
                      disabled={buttonLoading}
                    >
                      {buttonLoading ? "Submitting move..." : "Submit move"}
                    </button>
                  </div>
                ) : (
                  // Else, if votes <= 0, prevent voting
                  <span>Insufficient votes (0).</span>
                )
              ) : (
                // Show loading state while collecting votes
                <span>Loading your available votes...</span>
              )
            ) : proposalsExist ? (
              // If voting period if finished and proposals exist, show fianlization
              <div className={styles.chess__board_vote}>
                <span>
                  The voting period has finished. Please finalize your teams
                  move.
                </span>
                <button onClick={finalizeTurn} disabled={buttonLoading}>
                  {buttonLoading ? "Finalizing move..." : "Finalize move"}
                </button>
              </div>
            ) : !loading ? (
              // Else if not loading
              votes > 0 ? (
                // And votes > 0, enable pre-finalization voting
                <div className={styles.chess__board_vote}>
                  <span>
                    You can vote with {votes} vote(s), this turn. To vote for a
                    move, enter its beginning and end position as one string.
                    For example, to move c2 to c4, enter "c2c4".
                  </span>
                  <input
                    type="text"
                    placeholder="c2c4"
                    value={newMove}
                    onChange={(e) => setNewMove(e.target.value)}
                  />
                  <button
                    onClick={() => submitVote(newMove)}
                    disabled={buttonLoading}
                  >
                    {buttonLoading ? "Submitting move..." : "Submit move"}
                  </button>
                </div>
              ) : (
                // Else if votes <= 0, prevent voting
                <span>Insufficient votes (0).</span>
              )
            ) : (
              // Loading state while collecting votes
              <span>Loading your available votes...</span>
            )
          ) : (
            // No auth
            <span>You are not authenticated.</span>
          )}
        </div>
      </div>

      <div className="sizer">
        {/* General statistics */}
        <div className={styles.chess__description}>
          <h3>General Details</h3>
          <p>High-level overview of the current state of the game.</p>
        </div>
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
            <span>{game.snapshot_block.toLocaleString()}</span>
          </div>
          <div>
            <h4>Minutes to turn timeout</h4>
            <span>
              {(
                (game.turn_over - Math.round(Date.now() / 1000)) /
                60
              ).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Proposed moves this round */}
        <div className={styles.chess__description}>
          <h3>Proposed Moves</h3>
          <p>
            These are moves that have been proposed either by you or other DAO
            members. Upon turn timeout, the move with the greatest number of
            votes will be finalized. You can vote in favor of others' moves or
            vote for your own custom move above.
          </p>
        </div>
        <ProposedMovesTable
          moves={game.current.proposed_moves}
          voteHandler={submitVote}
          loading={buttonLoading}
        />

        {/* Current voters */}
        <div className={styles.chess__description}>
          <h3>Current Voters</h3>
          <p>Addresses that have voted this turn.</p>
        </div>
        <CurrentRoundVoters voters={game.current.voters} />

        {/* Historic moves */}
        <div className={styles.chess__description}>
          <h3>Historic Moves</h3>
          <p>History of moves made during the game.</p>
        </div>
        <HistoricMovesTable moves={game.historic_moves} />
      </div>
    </Layout>
  );
}

// Chess board
function Chess({ fen }) {
  // Width setup
  const [width, setWidth] = useState(500);

  /**
   * Update dimensions on page resize
   */
  const updateDimensions = () => {
    // If window > 600px
    if (window.innerWidth > 600) {
      // Force 500px chessboard
      setWidth(500);
    } else {
      // Else, force window width - 50px (25px left/right padding)
      setWidth(window.innerWidth - 50);
    }
  };

  // On mount
  useEffect(() => {
    // Update dimensions
    updateDimensions();
    // Add listener to update on resize
    window.addEventListener("resize", updateDimensions);

    // On unmount
    return () => {
      // Remove listener
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Return chessboard rendering fen position
  return <Chessboard position={fen} width={width} />;
}

// Proposed moves table
function ProposedMovesTable({ moves, voteHandler, loading }) {
  const movesColumns = [
    {
      Header: "Timestamp",
      accessor: "timestamp",
      Cell: (props) => (
        <span>{dayjs.unix(props.value).format("MMMM D, YYYY (HH:mm)")}</span>
      ),
    },
    {
      Header: "Proposer",
      accessor: "proposer",
      Cell: (props) => (
        <a
          className={styles.table__address}
          href={`https://etherscan.io/address/${props.value}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {props.value.substr(0, 6) +
            "..." +
            props.value.slice(props.value.length - 4)}
        </a>
      ),
    },
    { Header: "Move", accessor: "move" },
    { Header: "Votes", accessor: "votes" },
    {
      Header: "Vote",
      accessor: "move",
      Cell: (props) => (
        <button
          className={styles.table__button}
          onClick={() => voteHandler(props.value)}
          disabled={loading}
        >
          Vote
        </button>
      ),
    },
  ];

  return moves.length < 1 ? (
    <div className={styles.chess__details_card}>
      <span className={styles.empty__table}>No current round moves found.</span>
    </div>
  ) : (
    <ReactTable
      className="proposed__table"
      data={moves}
      columns={movesColumns}
      pageSize={moves.length}
      showPagination={false}
    />
  );
}

// Current round table
function CurrentRoundVoters({ voters }) {
  const votersColumns = [
    {
      Header: "Timestamp",
      accessor: "timestamp",
      Cell: (props) => (
        <span>{dayjs.unix(props.value).format("MMMM D, YYYY (HH:mm)")}</span>
      ),
    },
    {
      Header: "Voter",
      accessor: "voter",
      Cell: (props) => (
        <a
          className={styles.table__address}
          href={`https://etherscan.io/address/${props.value}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {props.value.substr(0, 6) +
            "..." +
            props.value.slice(props.value.length - 4)}
        </a>
      ),
    },
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
      className="voters__table"
      data={voters}
      columns={votersColumns}
      pageSize={voters.length}
      showPagination={false}
    />
  );
}

// Historic moves table
function HistoricMovesTable({ moves }) {
  const historicMovesColumns = [
    { Header: "Team", accessor: "team" },
    {
      Header: "Date",
      accessor: "timestamp",
      Cell: (props) => (
        <span>{dayjs.unix(props.value).format("MMMM D, YYYY (HH:mm)")}</span>
      ),
    },
    {
      Header: "Proposer",
      accessor: "proposer",
      Cell: (props) => (
        <a
          className={styles.table__address}
          href={`https://etherscan.io/address/${props.value}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {props.value.substr(0, 6) +
            "..." +
            props.value.slice(props.value.length - 4)}
        </a>
      ),
    },
    {
      Header: "Votes",
      accessor: "votes",
      Cell: (props) => <span>{props.value.toLocaleString()}</span>,
    },
    { Header: "Move", accessor: "move" },
  ];

  return moves.length < 1 ? (
    <div className={styles.chess__details_card}>
      <span className={styles.empty__table}>No historic moves found.</span>
    </div>
  ) : (
    <ReactTable
      className="historic__table"
      data={moves.reverse()}
      columns={historicMovesColumns}
      pageSize={moves.length}
      showPagination={false}
    />
  );
}

// Collect game SSR
export async function getServerSideProps({ params: { id } }) {
  const game = await collectGameById(id);

  // Return game detail as props
  return {
    props: {
      game,
    },
  };
}

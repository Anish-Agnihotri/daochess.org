import axios from "axios"; // Requests
import { useState } from "react"; // State management
import Layout from "components/Layout"; // Layout wrapper
import { toast } from "react-toastify"; // Toast notifications
import { useRouter } from "next/router"; // Navigation
import styles from "styles/pages/Create.module.scss"; // Styles

export default function Create() {
  // Router setup
  const router = useRouter();

  // Local state
  const [timeout, setTimeout] = useState(240);
  const [dao1Name, setDao1Name] = useState("");
  const [dao2Name, setDao2Name] = useState("");
  const [loading, setLoading] = useState(false);
  const [dao1Address, setDao1Address] = useState("");
  const [dao2Address, setDao2Address] = useState("");
  const [dao1Decimals, setDao1Decimals] = useState(18);
  const [dao2Decimals, setDao2Decimals] = useState(18);

  /**
   * Creates game using local state params
   */
  const createGame = async () => {
    setLoading(true); // Toggle loading

    // Setup game params object
    const gameParams = {
      dao1Name,
      dao1Address,
      dao1Decimals,
      dao2Name,
      dao2Address,
      dao2Decimals,
      timeout,
    };

    try {
      // Post to new game endpoint
      const response = await axios.post("/api/games/create", gameParams);
      toast.success("daochess game successfully created.");
      // Redirect to game page if successful
      router.push(`/game/${response.data.id}`);
    } catch (error) {
      // If error is identifiable
      if (error.response.data.error) {
        // Toast error
        toast.error(`Error: ${error.response.data.error}`);
      } else {
        // Else, toast an unexpected error
        toast.error("Error: unexpected error, please try again.");
      }
    }

    setLoading(false); // Toggle loading
  };

  return (
    <Layout>
      <div className={styles.create}>
        <div className="sizer">
          {/* Create game details */}
          <h3>Create game</h3>
          <p>
            daochess games are fixed-time, turn-based games following standard
            Chess rules. When you create a game, a snapshot of token balances
            for both DAOs is taken.
          </p>
          <p>
            Each turn timeout, token holders from the playside DAO vote on their
            next Chess move. If no moves are made during the timeout, the
            timeout is indefinitely extended until the first move is made (which
            is automatically accepted).
          </p>
          <p>
            <strong>Note:</strong> 2 DAOS can only have 1 active game against
            each other (as a rough anti-spam mechanism), and DAO tokens must
            have a public decimals function.
          </p>

          {/* Input form */}
          <div className={styles.create__form}>
            {/* DAO Competitor # 1 */}
            <div>
              <h4>DAO Competitor #1</h4>
              <span>
                Name, governance token address, and token decimals of first
                competing DAO.
              </span>

              <input
                type="text"
                placeholder="Gitcoin DAO"
                value={dao1Name}
                onChange={(e) => setDao1Name(e.target.value)}
              />
              <input
                type="text"
                placeholder="0xde30da39c46104798bb5aa3fe8b9e0e1f348163f"
                value={dao1Address}
                onChange={(e) => setDao1Address(e.target.value)}
              />
              <input
                type="number"
                placeholder="18"
                value={dao1Decimals}
                min="0"
                max="18"
                step="1"
                onChange={(e) => setDao1Decimals(parseInt(e.target.value))}
              />
            </div>

            {/* DAO Competitor #2 */}
            <div>
              <h4>DAO Competitor #2</h4>
              <span>
                Name, governance token address, and token decimals of second
                competing DAO.
              </span>

              <input
                type="text"
                placeholder="PleasrDAO"
                value={dao2Name}
                onChange={(e) => setDao2Name(e.target.value)}
              />
              <input
                type="text"
                placeholder="0xba962a81f78837751be8a177378d582f337084e6"
                value={dao2Address}
                onChange={(e) => setDao2Address(e.target.value)}
              />
              <input
                type="number"
                placeholder="18"
                value={dao2Decimals}
                min="0"
                max="18"
                step="1"
                onChange={(e) => setDao2Decimals(parseInt(e.target.value))}
              />
            </div>

            {/* Turn timeout */}
            <div>
              <h4>Turn timeout</h4>
              <span>
                Move proposal and voting time for each turn{" "}
                <strong>(in minutes)</strong>.
              </span>

              <input
                type="number"
                min="5"
                step="5"
                placeholder="240"
                value={timeout}
                onChange={(e) => setTimeout(e.target.value)}
              />
            </div>

            {/* Create game button */}
            <button onClick={createGame} disabled={loading}>
              {!loading ? "Create game" : "Creating game..."}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

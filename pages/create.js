import { useState } from "react";
import Layout from "components/Layout";
import styles from "styles/pages/Create.module.scss";
import { useRouter } from "next/router";

export default function Create() {
  const router = useRouter();
  const [dao1Name, setDao1Name] = useState("");
  const [dao1Address, setDao1Address] = useState("");
  const [dao2Name, setDao2Name] = useState("");
  const [dao2Address, setDao2Address] = useState("");
  const [timeout, setTimeout] = useState(240);
  const [loading, setLoading] = useState(false);

  const createGame = async () => {
    setLoading(true);

    const gameParams = {
      dao1Name,
      dao1Address,
      dao2Name,
      dao2Address,
      timeout,
    };

    try {
      const response = await axios.post("/api/games/create", gameParams);
      toast.success("daochess game successfully created.");
      router.push(`/game/${response.data.id}`);
    } catch (error) {
      if (error.response.data.error) {
        toast.error(`Error: ${error.response.data.error}`);
      } else {
        toast.error("Error: unexpected error, please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className={styles.create}>
        <div className="sizer">
          <h3>Create game</h3>
          <p>
            daochess games are fixed-time, turn-based games following standard
            Chess rules. When you create a game, a snapshot of token balances
            for both DAOs is taken. Each turn timeout, token holders from the
            playside DAO vote on their next Chess move. If no moves are made
            during the timeout, the timeout is indefinitely extended until the
            first move is made (which is automatically accepted).
          </p>

          <div className={styles.create__form}>
            <div>
              <h4>DAO Competitor #1</h4>
              <span>
                Name and governance token address of first competing DAO.
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
            </div>
            <div>
              <h4>DAO Competitor #2</h4>
              <span>
                Name and governance token address of second competing DAO.
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
            </div>
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

            <button onClick={createGame} disabled={loading}>
              {!loading ? "Create game" : "Creating..."}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

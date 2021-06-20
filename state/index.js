// State helpers
import eth from "state/eth";
import chess from "state/chess";

// State wrapper
export default function StateProvider({ children }) {
  return (
    <eth.Provider>
      <chess.Provider>{children}</chess.Provider>
    </eth.Provider>
  );
}

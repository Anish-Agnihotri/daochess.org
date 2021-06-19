// State helpers
import eth from "@state/eth";

// State wrapper
export default function StateProvider({ children }) {
	return <eth.Provider>{children}</eth.Provider>;
}

import "@styles/globals.scss";
import StateProvider from "@state/index";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

export default function DAOChess({ Component, pageProps }) {
	return (
		<StateProvider>
			<Component {...pageProps} />
		</StateProvider>
	);
}

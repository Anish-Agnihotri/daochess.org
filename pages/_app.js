import "@styles/globals.scss";
import StateProvider from "@state/index";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-table-6/react-table.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

export default function DAOChess({ Component, pageProps }) {
  return (
    <>
      <StateProvider>
        <Component {...pageProps} />
      </StateProvider>
      <ToastContainer />
    </>
  );
}

// Wrappers
import state from "utils/state"; // State management
import { ToastContainer } from "react-toastify"; // Toast notifications

// Styles
import "@styles/globals.scss"; // Global styles
import "react-table-6/react-table.css"; // Tables
import "react-toastify/dist/ReactToastify.css"; // Toast notifications
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"; // Loader

export default function DAOChess({ Component, pageProps }) {
  return (
    // Wrap page in state provider + add toast container
    <>
      <state.Provider>
        <Component {...pageProps} />
      </state.Provider>
      <ToastContainer />
    </>
  );
}

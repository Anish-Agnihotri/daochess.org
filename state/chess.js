import axios from "axios";
import { toast } from "react-toastify";
import { createContainer } from "unstated-next"; // Global state provider

function useChess() {
  const createGame = async (gameParams) => {
    try {
      const response = await axios.post("/api/games/create", gameParams);
      toast.success("daochess game successfully created.");
      return response.data.id;
    } catch (error) {
      if (error.response.data.error) {
        toast.error(`Error: ${error.response.data.error}`);
      } else {
        toast.error("Error: unexpected error, please try again.");
      }
    }
  };

  const getAllGames = async () => {
    const response = await axios.get("/api/games/list");
    return response.data;
  };

  return {
    createGame,
    getAllGames,
  };
}

// Create unstated-next container
const chess = createContainer(useChess);
export default chess;

import fleekStorage from "@fleekhq/fleek-storage-js";
import { fleekAuth } from "utils/ethers";

export const collectGameById = async (id) => {
  let game;
  try {
    const gameRaw = await fleekStorage.get({
      ...fleekAuth,
      key: id,
      getOptions: ["data"],
    });
    game = JSON.parse(gameRaw.data.toString());
  } catch {
    game = null;
  }

  return game;
};

export default async (req, res) => {
  const { id } = req.body;
  return res.send(await collectGameById(id));
};

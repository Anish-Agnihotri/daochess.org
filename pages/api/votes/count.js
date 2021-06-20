import snapshot from "@snapshot-labs/snapshot.js";
import { provider } from "utils/ethers";

export default async (req, res) => {
  const { address, token, block } = req.body;

  if (!address || !token || !block) {
    res
      .status(500)
      .send({ error: "Missing parameters for snapshot vote call. " });
  } else {
    try {
      const response = await snapshot.strategies["erc20-balance-of"](
        "Count",
        "1",
        provider,
        [address],
        {
          address: token,
          symbol: "Query",
          decimals: 18,
        },
        block
      );
      res.status(200).send({ votes: response[address] });
    } catch {
      res
        .status(500)
        .send({ error: "Unexpected error when collecting your balance." });
    }
  }
};

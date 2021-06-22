import { provider } from "utils/ethers"; // JSONRPCProvider (archive)
import snapshot from "@snapshot-labs/snapshot.js"; // Snapshot.js

/**
 * Collects a users balance for a token at a snapshot
 * @param {string} address of user
 * @param {string} token address
 * @param {number} decimals of token
 * @param {number} block snapshot
 * @returns {number} votes
 */
export const collectVotesForToken = async (address, token, decimals, block) => {
  // Collect balance of user
  const response = await snapshot.strategies["erc20-balance-of"](
    "Count",
    "1",
    provider,
    [address],
    {
      address: token,
      symbol: "Query",
      decimals: decimals,
    },
    block
  );

  // Return map filter for address
  return response[address];
};

export default async (req, res) => {
  // Collect require parameters
  const { address, token, decimals, block } = req.body;

  // Check for required parameters
  if (!address || !token || !decimals || !block) {
    res
      .status(500)
      .send({ error: "Missing parameters for snapshot vote call. " });
  }

  // Collect votes
  try {
    const votes = await collectVotesForToken(address, token, decimals, block);
    res.status(200).send({ votes });
  } catch {
    // Send error if can't collect votes
    res
      .status(500)
      .send({ error: "Unexpected error when collecting your balance." });
  }
};

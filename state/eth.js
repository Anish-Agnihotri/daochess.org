import { ethers } from "ethers"; // Ethers
import Onboard from "bnc-onboard"; // BNC Onboard
import { useState, useEffect } from "react"; // Local state management
import { createContainer } from "unstated-next"; // Global state provider

// Onboarding wallet providers
const wallets = [
  { walletName: "metamask" },
  {
    walletName: "walletConnect",
    infuraKey: process.env.NEXT_PUBLIC_INFURA_RPC,
  },
];

function useEth() {
  const [rawAddress, setRawAddress] = useState(null);
  const [address, setAddress] = useState(null); // User address
  const [onboard, setOnboard] = useState(null); // Onboard provider
  const [provider, setProvider] = useState(null); // Ethers provider

  /**
   * Unlock wallet, store ethers provider and address
   */
  const unlock = async () => {
    // Enables wallet selection via BNC onboard
    await onboard.walletSelect();
    await onboard.walletCheck();
  };

  // --> Lifecycle: on mount
  useEffect(async () => {
    // Onboard provider
    const onboard = Onboard({
      // Ethereum network
      networkId: 1,
      // Hide Blocknative branding
      hideBranding: true,
      // Setup custom wallets for selection
      walletSelect: {
        heading: "Connect to daochess",
        description: "Please select a wallet to authenticate with daochess.",
        wallets: wallets,
      },
      // Track subscriptions
      subscriptions: {
        // On wallet update
        wallet: async (wallet) => {
          // If wallet provider exists
          if (wallet.provider) {
            // Collect ethers provider
            const provider = new ethers.providers.Web3Provider(wallet.provider);

            // Collect address
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            // Collect ENS name
            const ensName = await provider.lookupAddress(address);

            // Update provider and address
            setProvider(provider);
            setRawAddress(address);
            setAddress(ensName ? ensName : address);
          } else {
            setProvider(null);
            setRawAddress(null);
            setAddress(null);
          }
        },
      },
      // Force connect on walletCheck for WalletConnect
      walletCheck: [{ checkName: "connect" }],
    });

    // Update onboard
    setOnboard(onboard);
  }, []);

  return {
    provider,
    address,
    rawAddress,
    unlock,
  };
}

// Create unstated-next container
const eth = createContainer(useEth);
export default eth;

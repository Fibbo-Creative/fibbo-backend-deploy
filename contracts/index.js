import dotenv from "dotenv";
import { ethers } from "ethers";
import {
  suggestionsAddress,
  marketAddress,
  verificationAddress,
} from "./address.js";
import { MARKETPLACE_ABI, COMMUNITY_ABI, VERIFICATION_ABI } from "./abi.js";
import { listenToMarketEvents } from "./eventListeners/marketListener.js";
dotenv.config();

const web3provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.testnet.fantom.network/"
);

const managerWallet = new ethers.Wallet(
  process.env.MANAGER_PRIVATE_KEY,
  web3provider
);

const faucetWallet = new ethers.Wallet(
  process.env.FAUCET_PRIVATE_KEY,
  web3provider
);

const SUGGESTION_CONTRACT = new ethers.Contract(
  suggestionsAddress,
  COMMUNITY_ABI,
  managerWallet
);

const MARKET_CONTRACT = new ethers.Contract(
  marketAddress,
  MARKETPLACE_ABI,
  managerWallet
);

const VERIFICATION_CONTRACT = new ethers.Contract(
  verificationAddress,
  VERIFICATION_ABI,
  managerWallet
);

export {
  web3provider,
  managerWallet,
  faucetWallet,
  SUGGESTION_CONTRACT,
  MARKET_CONTRACT,
  VERIFICATION_CONTRACT,
};

export const listenToEvents = () => {
  if (MARKET_CONTRACT !== undefined) {
    listenToMarketEvents();
  }
};

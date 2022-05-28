import dotenv from "dotenv";
import { ethers } from "ethers";
import { suggestionsAddress, marketAddress } from "./address.js";
import { marketAbi, suggestionsAbi } from "./abi.js";
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
  suggestionsAbi,
  managerWallet
);

const MARKET_CONTRACT = new ethers.Contract(
  marketAddress,
  marketAbi,
  managerWallet
);

export {
  web3provider,
  managerWallet,
  faucetWallet,
  SUGGESTION_CONTRACT,
  MARKET_CONTRACT,
};

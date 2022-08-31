import dotenv from "dotenv";
import { ethers } from "ethers";
import {
  suggestionsAddress,
  marketAddress,
  verificationAddress,
  auctionAddress,
  wftmAddress,
  nftColectionAddress,
  factoryAddress,
} from "./address.js";
import {
  MARKETPLACE_ABI,
  COMMUNITY_ABI,
  VERIFICATION_ABI,
  AUCTION_ABI,
  WFTM_ABI,
  COLLECTION_ABI,
  FACTORY_ABI,
} from "./abi.js";
import { listenToMarketEvents } from "./eventListeners/marketListener.js";
import { listenToAuctionEvents } from "./eventListeners/auctionListener.js";
import { listenToFactoryEvents } from "./eventListeners/factoryListener.js";
dotenv.config();

const web3provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.testnet.fantom.network/"
);

const getHigherGWEI = async () => {
  const price = (await web3provider.getGasPrice()) * 2;

  return price;
};

const calculateGasMargin = (value) => {
  return value
    .mul(ethers.BigNumber.from(10000).add(ethers.BigNumber.from(1000)))
    .div(ethers.BigNumber.from(10000));
};

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

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

const AUCTION_CONTRACT = new ethers.Contract(
  auctionAddress,
  AUCTION_ABI,
  managerWallet
);

const FACTORY_CONTRACT = new ethers.Contract(
  factoryAddress,
  FACTORY_ABI,
  managerWallet
);

const VERIFICATION_CONTRACT = new ethers.Contract(
  verificationAddress,
  VERIFICATION_ABI,
  managerWallet
);

const WFTM_CONTRACT = new ethers.Contract(wftmAddress, WFTM_ABI, managerWallet);

const getERC721Contract = (collectionAddress) => {
  return new ethers.Contract(collectionAddress, COLLECTION_ABI, managerWallet);
};
export {
  web3provider,
  getHigherGWEI,
  managerWallet,
  faucetWallet,
  ADDRESS_ZERO,
  SUGGESTION_CONTRACT,
  MARKET_CONTRACT,
  VERIFICATION_CONTRACT,
  AUCTION_CONTRACT,
  WFTM_CONTRACT,
  FACTORY_CONTRACT,
  getERC721Contract,
};

export const listenToEvents = () => {
  if (MARKET_CONTRACT !== undefined) {
    listenToMarketEvents();
  }
  if (AUCTION_CONTRACT !== undefined) {
    listenToAuctionEvents();
  }
  if (FACTORY_CONTRACT !== undefined) {
    listenToFactoryEvents();
  }
};

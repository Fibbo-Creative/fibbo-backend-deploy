import dotenv from "dotenv";
import { ethers } from "ethers";
import { addressRegistry, wftmAddress } from "./address.js";
import {
  MARKETPLACE_ABI,
  COMMUNITY_ABI,
  VERIFICATION_ABI,
  AUCTION_ABI,
  WFTM_ABI,
  COLLECTION_ABI,
  FACTORY_ABI,
  ADDRESS_REGISTRY_ABI,
} from "./abi.js";
import { listenToMarketEvents } from "./eventListeners/marketListener.js";
import { listenToAuctionEvents } from "./eventListeners/auctionListener.js";
import { listenToFactoryEvents } from "./eventListeners/factoryListener.js";
dotenv.config();

const IPFS_BASE_URL = "https://fibbocreative.mypinata.cloud/ipfs";
const web3provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/fantom_testnet"
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

const ADDRESS_REGISTRY_CONTRACT = new ethers.Contract(
  addressRegistry,
  ADDRESS_REGISTRY_ABI,
  managerWallet
);

const WFTM_CONTRACT = new ethers.Contract(wftmAddress, WFTM_ABI, managerWallet);

const getMarketContract = async () => {
  const marketAddress = await ADDRESS_REGISTRY_CONTRACT.marketplace();
  return new ethers.Contract(marketAddress, MARKETPLACE_ABI, managerWallet);
};

const getAuctionContract = async () => {
  const auctionAddress = await ADDRESS_REGISTRY_CONTRACT.auction();
  return new ethers.Contract(auctionAddress, AUCTION_ABI, managerWallet);
};

const getFactoryContract = async () => {
  const factoryAddress = await ADDRESS_REGISTRY_CONTRACT.factory();
  return new ethers.Contract(factoryAddress, FACTORY_ABI, managerWallet);
};

const getCommunityContract = async () => {
  const communityAddress = await ADDRESS_REGISTRY_CONTRACT.community();
  return new ethers.Contract(communityAddress, COMMUNITY_ABI, managerWallet);
};

const getVerificationContract = async () => {
  const verifyAddress = await ADDRESS_REGISTRY_CONTRACT.verification();
  return new ethers.Contract(verifyAddress, VERIFICATION_ABI, managerWallet);
};

const getERC721Contract = (collectionAddress) => {
  return new ethers.Contract(collectionAddress, COLLECTION_ABI, managerWallet);
};

export {
  web3provider,
  getHigherGWEI,
  managerWallet,
  faucetWallet,
  ADDRESS_ZERO,
  getERC721Contract,
  getMarketContract,
  getAuctionContract,
  getFactoryContract,
  getVerificationContract,
  getCommunityContract,
  WFTM_CONTRACT,
  IPFS_BASE_URL,
};

export const listenToEvents = () => {
  listenToMarketEvents();
  listenToAuctionEvents();
  listenToFactoryEvents();
};

import Auction from "../models/auction.js";

export const addNewAuction = async (doc) => {
  const auctionCreated = await Auction.create({ ...doc });
  return auctionCreated;
};

export const getAuctions = async (doc) => {
  const auctions = await Auction.find();
  return auctions;
};

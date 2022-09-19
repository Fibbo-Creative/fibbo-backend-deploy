import Auction from "../models/auction.js";

export const addNewAuction = async (doc) => {
  const auctionCreated = await Auction.create({ ...doc });
  return auctionCreated;
};

export const getAuctions = async (doc) => {
  const auctions = await Auction.find();
  return auctions;
};

export const getAuction = async (collection, tokenId) => {
  const auctions = await Auction.findOne({
    collectionAddress: collection,
    tokenId: tokenId,
  });
  return auctions;
};

export const updateReservePrice = async (collection, tokenId, newPrice) => {
  const auctionUpdated = await Auction.updateOne(
    {
      collectionAddress: collection,
      tokenId: tokenId,
    },
    { reservePrice: newPrice }
  );
  return auctionUpdated;
};

export const updateStartTime = async (collection, tokenId, startTime) => {
  const auctionUpdated = await Auction.updateOne(
    {
      collectionAddress: collection,
      tokenId: tokenId,
    },
    { starTime: startTime }
  );
  return auctionUpdated;
};

export const updateEndTime = async (collection, tokenId, endTime) => {
  const auctionUpdated = await Auction.updateOne(
    {
      collectionAddress: collection,
      tokenId: tokenId,
    },
    { endTime: endTime }
  );
  return auctionUpdated;
};

export const updateStarted = async (collection, tokenId) => {
  const auctionUpdated = await Auction.updateOne(
    {
      collectionAddress: collection,
      tokenId: tokenId,
    },
    { started: true }
  );
  return auctionUpdated;
};

export const deleteAuction = async (collection, tokenId) => {
  const deletedAuction = await Auction.deleteOne({
    collectionAddress: collection,
    tokenId: tokenId,
  });
  return deletedAuction;
};

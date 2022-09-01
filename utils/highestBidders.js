import HighestBidder from "../models/highestBidders.js";

export const createHighestBidder = async (doc) => {
  const created = await HighestBidder.create(doc);
  return created;
};

export const getHighestBidder = async (collection, tokenId) => {
  const highestBidder = await HighestBidder.findOne({
    collectionAddress: collection,
    tokenId: tokenId,
  });
  return highestBidder;
};

export const updateHighestBidder = async (collection, tokenId, newBidder) => {
  const updated = await HighestBidder.updateOne(
    {
      collectionAddress: collection,
      tokenId: tokenId,
    },
    { bidder: newBidder }
  );
  return updated;
};

export const deleteHighestBidder = async (collection, tokenId) => {
  const deleted = await HighestBidder.deleteOne({
    collectionAddress: collection,
    tokenId: tokenId,
  });
  return deleted;
};

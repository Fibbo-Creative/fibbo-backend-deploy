import HighestBidder from "../models/highestBidders.js";
import { getPayTokenInfo } from "./payTokens.js";

export const formatBids = async (bidsData) => {
  let formatted = await Promise.all(
    bidsData.map(async (item) => {
      const payTokenInfo = await getPayTokenInfo(item.payToken);
      if (item._doc) {
        return {
          ...item._doc,

          payToken: payTokenInfo,
        };
      } else {
        return {
          ...item,
          payToken: payTokenInfo,
        };
      }
    })
  );
  return formatted;
};

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

export const getBidsFromWallet = async (wallet) => {
  const highestBidder = await HighestBidder.find({
    bidder: wallet,
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

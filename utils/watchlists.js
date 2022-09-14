import Watchlist from "../models/watchlist.js";

export const createWatchlist = async (doc) => {
  const watchlist = await Watchlist.create(doc);
  if (watchlist) {
    return watchlist._doc;
  }
};

export const deleteWatchlist = async (collection, from) => {
  const watchlist = await Watchlist.deleteOne({
    collectionAddress: collection,
    for: from,
  });

  return watchlist;
};

export const getWatchlist = async (collection, from) => {
  const watchlist = await Watchlist.findOne({
    collectionAddress: collection,
    for: from,
  });

  return watchlist._doc;
};

export const getWatchlistForWallet = async (from) => {
  const watchlist = await Watchlist.find({
    for: from,
  });

  return watchlist;
};

import FavoriteItem from "../models/favoriteItem.js";

export const createFavoriteItem = async (doc) => {
  const favorite = await FavoriteItem.create(doc);
  if (favorite) {
    return favorite._doc;
  }
};

export const deleteFavoriteItem = async (collection, tokenId, from) => {
  const favorite = await FavoriteItem.deleteOne({
    collectionAddress: collection,
    tokenId: tokenId,
    for: from,
  });

  return favorite;
};

export const getFavoriteItem = async (collection, tokenId, from) => {
  const favorites = await FavoriteItem.findOne({
    collectionAddress: collection,
    tokenId: tokenId,
    for: from,
  });
  return favorites;
};

export const getFavoriteItemFromWallet = async (from) => {
  const favorites = await FavoriteItem.find({
    for: from,
  });
  return favorites;
};

export const getFavoriteItemForToken = async (collection, tokenId) => {
  const favorites = await FavoriteItem.find({
    collectionAddress: collection,
    tokenId: tokenId,
  });
  return favorites;
};

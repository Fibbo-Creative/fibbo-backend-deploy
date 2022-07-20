import Offers from "../models/offers.js";
import { getProfileInfo } from "./profiles.js";

export const getItemOffers = async (collectionAddress, tokenId) => {
  const offers = await Offers.find({
    collectionAddress: collectionAddress,
    tokenId: tokenId,
  });
  return offers;
};

export const sortHigherOffer = (a, b) => {
  if (a.price > b.price) {
    return -1;
  }
  if (a.price < b.price) {
    return 1;
  }
  return 0;
};

export const getOffer = async (collectionAddress, tokenId, creator) => {
  const offers = await Offers.findOne({
    collectionAddress: collectionAddress,
    tokenId: tokenId,
    creator: creator,
  });
  return offers;
};

export const formatOffers = async (offersData) => {
  let formatted = await Promise.all(
    offersData.map(async (item) => {
      const { creator } = item;
      const fromInfo = await getProfileInfo(creator);
      return {
        ...item._doc,
        creator: fromInfo,
      };
    })
  );
  return formatted;
};

export const addNewOffer = async (doc) => {
  const offerCreated = await Offers.create({ ...doc });
  return offerCreated;
};

export const deleteOffer = async (collection, tokenId, creator) => {
  const offerDeleted = await Offers.deleteOne({
    collectionAddress: collection,
    tokenId: tokenId,
    creator: creator,
  });
  return offerDeleted;
};
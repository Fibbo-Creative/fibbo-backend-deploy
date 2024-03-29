import Offers from "../models/offers.js";
import AcceptedOffers from "../models/acceptedOffers.js";

import { getPayTokenInfo } from "./payTokens.js";
import { getProfileInfo } from "./profiles.js";

export const getItemOffers = async (collectionAddress, tokenId) => {
  const offers = await Offers.find({
    collectionAddress: collectionAddress,
    tokenId: tokenId,
  });
  return offers;
};

export const hasExpired = (offer) => {
  const deadline = offer.deadline;

  const deadLineDate = new Date(deadline * 1000).getTime();
  const nowDate = new Date().getTime();

  return nowDate > deadLineDate;
};

export const getOffersFromWallet = async (address) => {
  const offers = await Offers.find({
    creator: address,
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

export const getOffers = async () => {
  const offers = await Offers.find();
  return offers;
};

export const formatOffers = async (offersData) => {
  let formatted = await Promise.all(
    offersData.map(async (item) => {
      const { creator } = item;
      const fromInfo = await getProfileInfo(creator);
      const payTokenInfo = await getPayTokenInfo(item.payToken);
      if (item._doc) {
        return {
          ...item._doc,
          creator: fromInfo,
          payToken: payTokenInfo,
        };
      } else {
        return {
          ...item,
          creator: fromInfo,
          payToken: payTokenInfo,
        };
      }
    })
  );
  return formatted;
};

export const addNewOffer = async (doc) => {
  const offerCreated = await Offers.create({ ...doc });
  return offerCreated;
};

export const updateOffer = async (
  creator,
  collectionAddress,
  tokenId,
  payToken,
  price,
  deadline
) => {
  const offerCreated = await Offers.updateOne(
    {
      creator: creator,
      collectionAddress: collectionAddress,
      tokenId: tokenId,
    },
    {
      payToken: payToken,
      price: price,
      deadline: deadline,
    }
  );
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

export const addAcceptedOffer = async (doc) => {
  const offerAccepted = await AcceptedOffers.create(doc);
  return offerAccepted;
};

export const getOfferAccepted = async (collectionAddress, tokenId) => {
  const offerAccepted = await AcceptedOffers.findOne({
    collectionAddress: collectionAddress,
    tokenId: tokenId,
  });
  return offerAccepted;
};

export const deleteAcceptedOffer = async (collection, tokenId, creator) => {
  const offerDeleted = await AcceptedOffers.deleteOne({
    collectionAddress: collection,
    tokenId: tokenId,
    creator: creator,
  });
  return offerDeleted;
};

import Collection from "../models/collection.js";
import Nft from "../models/nft.js";

export const getCollectionInfo = async (collectionAddress) => {
  let _collection;
  if (!collectionAddress.includes("0x")) {
    _collection = await Collection.findOne({
      customURL: collectionAddress,
    });
  } else {
    _collection = await Collection.findOne({
      contractAddress: collectionAddress,
    });
  }

  if (_collection) return _collection;
};

export const updateTotalNfts = async (collectionAddress, numberOfItems) => {
  const updatedCollection = await Collection.updateOne(
    {
      contractAddress: collectionAddress,
    },
    { numberOfItems: numberOfItems + 1 }
  );
  return updatedCollection;
};

export const getItemsFromCollection = async (collectionAddress) => {
  const items = await Nft.find({
    collectionAddress: collectionAddress,
  });

  return items;
};

export const getCollectionsAvailableOwner = async (owner) => {
  const collections = await Collection.find({
    creator: { $in: ["public", owner] },
  });
  return collections;
};

export const getCollectionsFromOwner = async (owner) => {
  const collections = await Collection.find({
    creator: owner,
  });
  return collections;
};

export const createCollection = async (doc) => {
  const created = await Collection.create(doc);
  return created;
};

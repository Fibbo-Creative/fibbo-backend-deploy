import Collection from "../models/collection.js";

export const getCollectionInfo = async (collectionAddress) => {
  const _collection = await Collection.findOne({
    contractAddress: collectionAddress,
  });

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

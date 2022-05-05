import Collection from "../models/collection.js";

export const getCollectionInfo = async (collectionAddress) => {
  const _collection = await Collection.findOne({
    contractAddress: collectionAddress,
  });

  if (_collection) return _collection;
};

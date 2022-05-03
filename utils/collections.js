import Collection from "../models/collection.js";

export const getCollectionInfo = async (collectionAddress) => {
  console.log(collectionAddress);
  const _collection = await Collection.findOne({
    contractAddress: collectionAddress,
  });
  console.log(_collection);
  if (_collection) return _collection;
};

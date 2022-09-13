import UserCollectionOptions from "../models/userCollectionOptions.js";

export const createUserCollectionOptions = async (doc) => {
  const created = await UserCollectionOptions.create(doc);
  return created;
};

export const setNotShowRedirect = async (collection, user) => {
  const created = await UserCollectionOptions.updateOne(
    { contractAddress: collection, user: user },
    { notShowRedirect: true }
  );
  return created;
};

export const getUserCollectionsOptions = async (collection, user) => {
  const created = await UserCollectionOptions.findOne({
    contractAddress: collection,
    user: user,
  });
  return created;
};

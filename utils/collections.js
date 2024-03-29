import Collection from "../models/collection.js";
import events from "../models/events.js";
import Events from "../models/events.js";
import Nft from "../models/nft.js";
import { getProfileInfo } from "./profiles.js";

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

export const getOwnersFromCollection = async (nftsFromCol) => {
  let owners = [];
  await Promise.all(
    nftsFromCol.map(async (item) => {
      let _owner = item.owner;
      let profileData = await getProfileInfo(_owner);
      if (!owners.find((profile) => profile.wallet === _owner)) {
        owners.push(profileData);
      }
    })
  );
  return owners;
};

export const getVolumenFromCollection = async (collection) => {
  let volumen = 0;
  let transferEvents = await Events.find({
    collectionAddress: collection,
    eventType: "TRANSFER",
  });

  transferEvents.forEach((event) => {
    volumen = volumen + event.price;
  });

  return volumen;
};

export const filterCollectionsByName = async (filterQuery) => {
  const nameFilteredCols = await Collection.find({
    name: { $regex: ".*" + filterQuery + ".*", $options: "i" },
  });

  return nameFilteredCols;
};

export const updateCollectionAddress = async (owner, name, address) => {
  const updatedCollection = await Collection.updateOne(
    {
      creator: owner,
      name: name,
    },
    { contractAddress: address }
  );
  return updatedCollection;
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

export const getCollectionByUrl = async (customURL) => {
  const collection = await Collection.findOne({
    customURL: customURL,
  });
  return collection;
};

export const getCollectionByName = async (name) => {
  const collection = await Collection.findOne({
    name: name,
  });
  return collection;
};

export const getItemsFromCollection = async (collectionAddress) => {
  const items = await Nft.find({
    collectionAddress: collectionAddress,
  });

  return items;
};

export const getCollectionsAvailable = async () => {
  const collections = await Collection.find({});
  return collections.filter((item) => item.creator !== "public");
};

export const getAllCollections = async () => {
  const collections = await Collection.find({}).sort({ name: 1 });
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

export const getCollectionAddress = async (creator, name) => {
  const collection = await Collection.findOne({
    creator: creator,
    name: name,
  });
  return collection.contractAddress;
};

export const editCollection = async (
  contractAddress,
  creator,
  name,
  description,
  logoImage,
  featuredImage,
  bannerImage,
  customURL,
  websiteURL,
  discordURL,
  telegramURL,
  instagramURL,
  explicitContent
) => {
  const created = await Collection.updateOne(
    {
      contractAddress: contractAddress,
      creator: creator,
    },
    {
      name: name,
      description: description,
      logoImage: logoImage,
      featuredImage: featuredImage,
      bannerImage: bannerImage,
      customURL: customURL,
      websiteURL: websiteURL,
      discordURL: discordURL,
      telegramURL: telegramURL,
      instagramURL: instagramURL,
      explicitContent: explicitContent,
    }
  );
  return created;
};

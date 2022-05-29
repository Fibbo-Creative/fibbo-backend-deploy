import Events from "../models/events.js";

export const getEventsFromNft = async (collectionAddress, tokenId) => {
  const eventsResult = await Events.find({
    collectionAddress: collectionAddress,
    tokenId: tokenId,
  });
  return eventsResult;
};

export const createEvent = async (doc) => {
  const newEvent = await Events.create(doc);
  if (newEvent) {
    return newEvent._doc;
  }
};

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const registerMintEvent = async (collectionAddress, tokenId, to) => {
  const doc = {
    eventType: "MINT",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: ADDRESS_ZERO,
    to: to,
    timestamp: new Date().toISOString(),
    price: 0,
  };

  const createdEvent = await createEvent(doc);

  if (createdEvent) {
    return createdEvent;
  }
};

export const registerListingEvent = async (
  collectionAddress,
  tokenId,
  from,
  price
) => {
  const doc = {
    tokenId: tokenId,
    eventType: "LISTING",
    collectionAddress: collectionAddress,
    from: from,
    to: ADDRESS_ZERO,
    timestamp: new Date().toISOString(),
    price: price,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent;
};

export const registerTransferEvent = async (
  collectionAddress,
  tokenId,
  from,
  to,
  price
) => {
  const doc = {
    eventType: "TRANSFER",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: from,
    to: to,
    timestamp: new Date().toISOString(),
    price: price,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent._doc;
};

export const registerChangePriceEvent = async (
  collectionAddress,
  tokenId,
  from,
  price
) => {
  const doc = {
    eventType: "CHANGE PRICE",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: from,
    to: from,
    timestamp: new Date().toISOString(),
    price: price,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent._doc;
};

export const registerUnlistItem = async (collectionAddress, tokenId, from) => {
  const doc = {
    eventType: "UNLISTED",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: from,
    to: from,
    timestamp: new Date().toISOString(),
    price: 0,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent._doc;
};

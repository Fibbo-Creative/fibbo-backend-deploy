import Events from "../models/events.js";

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const registerMintEvent = async (collectionAddress, tokenId, to) => {
  const doc = {
    eventType: "MINT",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: ADDRESS_ZERO,
    to: to,
    timestamp: new Date().toISOString().split("T")[0],
    price: 0,
  };

  const createdEvent = await Events.create(doc);

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
    timestamp: new Date().toISOString().split("T")[0],
    price: price,
  };

  const createdEvent = await Events.create(doc);
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
    timestamp: new Date().toISOString().split("T")[0],
    price: price,
  };

  const createdEvent = await Events.create(doc);
  if (createdEvent) return createdEvent._doc;
};

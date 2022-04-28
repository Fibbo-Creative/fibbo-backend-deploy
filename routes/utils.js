const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const registerMintEvent = async (
  sanity_client,
  collectionAddress,
  tokenId,
  to
) => {
  const doc = {
    _type: "event",
    eventType: "MINT",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: ADDRESS_ZERO,
    to: to,
    timestamp: new Date().toISOString().split("T")[0],
    price: 0,
  };

  const createdEvent = await sanity_client.create(doc);

  return createdEvent;
};

export const registerListingEvent = async (
  sanity_client,
  collectionAddress,
  tokenId,
  from,
  price
) => {
  const doc = {
    _type: "event",
    tokenId: tokenId,
    eventType: "LISTING",
    collectionAddress: collectionAddress,
    from: from,
    to: ADDRESS_ZERO,
    timestamp: new Date().toISOString().split("T")[0],
    price: price,
  };

  const createdEvent = await sanity_client.create(doc);

  return createdEvent;
};

export const registerTransferEvent = async (
  sanity_client,
  collectionAddress,
  tokenId,
  from,
  to,
  price
) => {
  const doc = {
    _type: "event",
    eventType: "TRANSFER",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: from,
    to: to,
    timestamp: new Date().toISOString().split("T")[0],
    price: price,
  };

  const createdEvent = await sanity_client.create(doc);

  return createdEvent;
};

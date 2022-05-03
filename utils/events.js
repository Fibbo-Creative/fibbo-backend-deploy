import Events from "../models/events.js";

export const getEventsFromNft = async (collectionAddress, tokenId) => {
  const eventsResult = await Events.find({
    collectionAddress: collectionAddress,
    tokenId: tokenId,
  });
  return eventsResult;
};

import Events from "../models/events.js";
import { getPayTokenInfo } from "./payTokens.js";
import { getProfileInfo } from "./profiles.js";

export const orderHistory = (a, b) => {
  if (a.timestamp > b.timestamp) {
    return -1;
  } else {
    return 1;
  }
};
export const getEventsFromNft = async (collectionAddress, tokenId) => {
  const eventsResult = await Events.find({
    collectionAddress: collectionAddress,
    tokenId: tokenId,
  }).sort({ timestamp: -1 });
  return eventsResult;
};

export const getEventsFromWallet = async (wallet) => {
  const fromEventsResult = await Events.find({
    from: wallet,
  });
  const toEventsResult = await Events.find({
    to: wallet,
  });
  let eventResult = fromEventsResult.concat(toEventsResult).sort(orderHistory);

  let _ids = [];
  eventResult = eventResult.map((ev) => {
    if (!_ids.includes(ev._id.toString())) {
      _ids.push(ev._id.toString());
      return ev;
    }
  });

  eventResult = eventResult.filter((ev) => ev !== undefined);

  return eventResult;
};

export const getAllTransfers = async () => {
  const eventsResult = await Events.count({ eventType: "TRANSFER" });
  return eventsResult;
};

export const formatHistory = async (historyData) => {
  try {
    let formatted = await Promise.all(
      historyData.map(async (item) => {
        const { from, to } = item;
        const fromInfo = await getProfileInfo(from);
        const toInfo = await getProfileInfo(to);
        const payTokenInfo = await getPayTokenInfo(item.payToken);
        if (item._doc) {
          if (from === ADDRESS_ZERO && to !== ADDRESS_ZERO) {
            return {
              ...item._doc,
              to: toInfo,
              payToken: payTokenInfo,
            };
          } else if (from !== ADDRESS_ZERO && to === ADDRESS_ZERO) {
            return {
              ...item._doc,
              from: fromInfo,
              payToken: payTokenInfo,
            };
          } else {
            return {
              ...item._doc,
              from: fromInfo,
              to: toInfo,
              payToken: payTokenInfo,
            };
          }
        } else {
          if (from === ADDRESS_ZERO && to !== ADDRESS_ZERO) {
            return {
              ...item,
              to: toInfo,
              payToken: payTokenInfo,
            };
          } else if (from !== ADDRESS_ZERO && to === ADDRESS_ZERO) {
            return {
              ...item,
              from: fromInfo,
              payToken: payTokenInfo,
            };
          } else {
            return {
              ...item,
              from: fromInfo,
              to: toInfo,
              payToken: payTokenInfo,
            };
          }
        }
      })
    );
    return formatted;
  } catch (e) {
    console.log(e);
  }
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
    eventType: "TRANSFER",
    eventDesc: "MINTED",
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
  price,
  payToken
) => {
  const doc = {
    tokenId: tokenId,
    eventType: "LISTING",
    eventDesc: "LISTED",
    collectionAddress: collectionAddress,
    from: from,
    to: ADDRESS_ZERO,
    timestamp: new Date().toISOString(),
    price: price,
    payToken: payToken,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent;
};

export const registerTransferEvent = async (
  collectionAddress,
  tokenId,
  from,
  to,
  price,
  payToken
) => {
  const doc = {
    eventType: "TRANSFER",
    eventDesc: "TRANSFER",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: from,
    to: to,
    timestamp: new Date().toISOString(),
    price: price,
    payToken: payToken,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent._doc;
};
export const registerAuctionPriceChanged = async (
  collectionAddress,
  tokenId,
  from,
  price,
  payToken
) => {
  const doc = {
    eventType: "AUCTION",
    eventDesc: "Subasta Actualizada",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: from,
    to: from,
    timestamp: new Date().toISOString(),
    price: price,
    payToken: payToken,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent._doc;
};

export const registerChangePriceEvent = async (
  collectionAddress,
  tokenId,
  from,
  price,
  payToken
) => {
  const doc = {
    eventType: "LISTING",
    eventDesc: "NEW PRICE",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: from,
    to: from,
    timestamp: new Date().toISOString(),
    price: price,
    payToken: payToken,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent._doc;
};

export const registerUnlistItem = async (collectionAddress, tokenId, from) => {
  const doc = {
    eventType: "LISTING",
    eventDesc: "UNLISTED",
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

export const registerOfferCreated = async (
  collectionAddress,
  tokenId,
  from,
  to,
  price,
  payToken
) => {
  const doc = {
    eventType: "OFFER",
    eventDesc: "NEW",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: from,
    to: to,
    timestamp: new Date().toISOString(),
    price: price,
    payToken: payToken,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent._doc;
};

export const registerOfferModified = async (
  collectionAddress,
  tokenId,
  from,
  to,
  price,
  payToken
) => {
  const doc = {
    eventType: "OFFER",
    eventDesc: "MODIFIED",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: from,
    to: to,
    timestamp: new Date().toISOString(),
    price: price,
    payToken: payToken,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent._doc;
};

export const registerOfferCancelled = async (
  collectionAddress,
  tokenId,
  from,
  to
) => {
  const doc = {
    eventType: "OFFER",
    eventDesc: "CANCEL",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: from,
    to: to,
    timestamp: new Date().toISOString(),
    price: 0,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent._doc;
};

export const registerOfferAccepted = async (
  collectionAddress,
  tokenId,
  from,
  to,
  price,
  payToken
) => {
  const doc = {
    eventType: "OFFER",
    eventDesc: "ACCEPTED",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: from,
    to: to,
    timestamp: new Date().toISOString(),
    price: price,
    payToken: payToken,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent._doc;
};

export const registerAuctionCreated = async (
  collectionAddress,
  tokenId,
  from,
  price,
  payToken
) => {
  const doc = {
    eventType: "AUCTION",
    eventDesc: "NEW",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: from,
    to: from,
    timestamp: new Date().toISOString(),
    price: price,
    payToken: payToken,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent._doc;
};

export const registerBidCreated = async (
  collectionAddress,
  tokenId,
  from,
  to,
  price,
  payToken
) => {
  const doc = {
    eventType: "AUCTION",
    eventDesc: "BID",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: from,
    to: to,
    timestamp: new Date().toISOString(),
    price: price,
    payToken: payToken,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent._doc;
};

export const registerAuctionPriceChanged = async (
  collectionAddress,
  tokenId,
  from,
  price,
  payToken
) => {
  const doc = {
    eventType: "AUCTION",
    eventDesc: "UPDATE",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: from,
    to: from,
    timestamp: new Date().toISOString(),
    price: price,
    payToken: payToken,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent._doc;
};

export const registerAuctionCanceled = async (
  collectionAddress,
  tokenId,
  from
) => {
  const doc = {
    eventType: "AUCTION",
    eventDesc: "CANCELED",
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

export const registerAuctionCompleted = async (
  collectionAddress,
  tokenId,
  from,
  price,
  payToken
) => {
  const doc = {
    eventType: "AUCTION",
    eventDesc: "FINISHED",
    tokenId: tokenId,
    collectionAddress: collectionAddress,
    from: from,
    to: from,
    timestamp: new Date().toISOString(),
    price: price,
    payToken: payToken,
  };

  const createdEvent = await createEvent(doc);
  if (createdEvent) return createdEvent._doc;
};

export const updateEvents = async () => {
  await Events.updateMany(
    { eventDesc: "Item minteado" },
    { eventDesc: "MINTED" }
  );
  await Events.updateMany(
    { eventDesc: "Item Listado" },
    { eventDesc: "LISTED" }
  );
  await Events.updateMany({ eventDesc: "Transfer" }, { eventDesc: "TRANSFER" });
  await Events.updateMany(
    { eventDesc: "Precio Actualizado" },
    { eventDesc: "NEW PRICE" }
  );
  await Events.updateMany(
    { eventDesc: "Quitado en venta" },
    { eventDesc: "UNLISTED" }
  );
  await Events.updateMany({ eventDesc: "Oferta creada" }, { eventDesc: "NEW" });
  await Events.updateMany(
    { eventDesc: "Oferta Modificada" },
    { eventDesc: "MODIFIED" }
  );
  await Events.updateMany(
    { eventDesc: "Oferta cancelada" },
    { eventDesc: "CANCELED" }
  );
  await Events.updateMany(
    { eventDesc: "Oferta acceptada" },
    { eventDesc: "ACCEPTED" }
  );
  await Events.updateMany(
    { eventDesc: "Subasta creada" },
    { eventDesc: "NEW" }
  );
  await Events.updateMany(
    { eventDesc: "Puja realizada" },
    { eventDesc: "BID" }
  );
  await Events.updateMany(
    { eventDesc: "Subasta Actualizada" },
    { eventDesc: "UPDATE" }
  );
  await Events.updateMany(
    { eventDesc: "Subasta cancelada" },
    { eventDesc: "CANCELED" }
  );
  await Events.updateMany(
    { eventDesc: "Subasta Finalizada" },
    { eventDesc: "FINISHED" }
  );
};

updateEvents;

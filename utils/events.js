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
    eventDesc: "Item minteado",
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
    eventDesc: "Item Listado",
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
    eventDesc: "Transfer",
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

export const registerChangePriceEvent = async (
  collectionAddress,
  tokenId,
  from,
  price,
  payToken
) => {
  const doc = {
    eventType: "LISTING",
    eventDesc: "Precio Actualizado",
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
    eventDesc: "Quitado en venta",
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
    eventDesc: "Oferta creada",
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
    eventDesc: "Oferta creada",
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
    eventDesc: "Oferta cancelada",
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
    eventDesc: "Oferta acceptada",
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
    eventDesc: "Subasta creada",
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
    eventDesc: "Puja realizada",
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

export const registerAuctionCanceled = async (
  collectionAddress,
  tokenId,
  from
) => {
  const doc = {
    eventType: "AUCTION",
    eventDesc: "Subasta cancelada",
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
    eventDesc: "Subasta Finalizada",
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
    { eventType: "CHANGE PRICE" },
    { eventType: "LISTING" }
  );
};

updateEvents;

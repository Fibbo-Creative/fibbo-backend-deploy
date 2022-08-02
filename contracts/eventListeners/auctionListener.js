import { formatEther } from "ethers/lib/utils.js";
import {
  addNewAuction,
  deleteAuction,
  getAuction,
  updateEndTime,
  updateReservePrice,
  updateStartTime,
} from "../../utils/auctions.js";
import {
  registerAuctionCanceled,
  registerAuctionCompleted,
  registerAuctionCreated,
  registerBidCreated,
  registerTransferEvent,
} from "../../utils/events.js";
import { changeNftOwner } from "../../utils/nfts.js";
import { ADDRESS_ZERO, AUCTION_CONTRACT } from "../index.js";

export const listenToAuctionEvents = () => {
  AUCTION_CONTRACT.on(
    "AuctionCreated",
    async (collection, tokenId, payToken) => {
      const auctionInDb = await getAuction(collection, tokenId);

      if (!auctionInDb) {
        const auctionInfo = await AUCTION_CONTRACT.getAuction(
          collection,
          tokenId
        );

        const doc = {
          collectionAddress: collection,
          tokenId: tokenId,
          payToken: payToken,
          reservePrice: formatEther(auctionInfo._reservePrice),
          buyNowPrice: formatEther(auctionInfo._buyNowPrice),
          startTime: auctionInfo._startTime,
          endTime: auctionInfo._endTime,
        };

        await addNewAuction(doc);
        await registerAuctionCreated(
          collection,
          tokenId,
          auctionInfo._owner,
          formatEther(auctionInfo._reservePrice),
          payToken
        );
      }
    }
  );

  AUCTION_CONTRACT.on("AuctionCancelled", async (collection, tokenId) => {
    const auctionInfo = await AUCTION_CONTRACT.getAuction(collection, tokenId);

    if (auctionInfo.owner !== ADDRESS_ZERO) {
      await deleteAuction(collection, tokenId);
      await registerAuctionCanceled(collection, tokenId, auctionInfo._owner);
    }
  });

  AUCTION_CONTRACT.on(
    "UpdateAuctionReservePrice",
    async (collection, tokenId, payToken, reservePrice) => {
      const auctionInfo = await AUCTION_CONTRACT.getAuction(
        collection,
        tokenId
      );
      if (auctionInfo.owner !== ADDRESS_ZERO) {
        await updateReservePrice(
          collection,
          tokenId.toNumber(),
          formatEther(reservePrice)
        );
      }
    }
  );
  AUCTION_CONTRACT.on(
    "UpdateAuctionStartTime",
    async (collection, tokenId, _startTime) => {
      const auctionInfo = await AUCTION_CONTRACT.getAuction(
        collection,
        tokenId
      );

      if (auctionInfo.owner !== ADDRESS_ZERO) {
        await updateStartTime(
          collection,
          tokenId.toNumber(),
          formatEther(_startTime)
        );
      }
    }
  );

  AUCTION_CONTRACT.on(
    "UpdateAuctionEndTime",
    async (collection, tokenId, endTime) => {
      const auctionInfo = await AUCTION_CONTRACT.getAuction(
        collection,
        tokenId
      );

      if (auctionInfo.owner !== ADDRESS_ZERO) {
        await updateEndTime(collection, tokenId.toNumber(), endTime);
      }
    }
  );

  AUCTION_CONTRACT.on("BidPlaced", async (collection, tokenId) => {
    const auctionInfo = await AUCTION_CONTRACT.getAuction(collection, tokenId);

    if (auctionInfo.owner !== ADDRESS_ZERO) {
      await registerBidCreated(collection, tokenId);
    }
  });

  AUCTION_CONTRACT.on(
    "AuctionResulted",
    async (prevOwner, collection, tokenId, winner, payToken, winingBid) => {
      await deleteAuction(collection, tokenId);

      //Actualizar token Info

      await changeNftOwner(collection, tokenId.toNumber(), prevOwner, winner);

      //Añadir eventos
      await registerAuctionCompleted(
        collection,
        tokenId,
        winner,
        formatEther(winingBid),
        payToken
      );
      await registerTransferEvent(
        collection,
        tokenId.toNumber(),
        prevOwner,
        winner,
        formatEther(winingBid)
      );
    }
  );
};

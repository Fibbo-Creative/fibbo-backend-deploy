import { formatEther } from "ethers/lib/utils.js";
import {
  addNewAuction,
  deleteAuction,
  getAuction,
  getAuctions,
  updateEndTime,
  updateReservePrice,
  updateStartTime,
} from "../../utils/auctions.js";
import {
  registerAuctionCanceled,
  registerAuctionCompleted,
  registerAuctionCreated,
  registerBidCreated,
  registerOfferCancelled,
  registerTransferEvent,
} from "../../utils/events.js";
import { changeNftOwner } from "../../utils/nfts.js";
import { getItemOffers } from "../../utils/offers.js";
import {
  ADDRESS_ZERO,
  AUCTION_CONTRACT,
  getERC721Contract,
  MARKET_CONTRACT,
} from "../index.js";

export const listenToAuctionEvents = () => {
  AUCTION_CONTRACT.on(
    "AuctionCreated",
    async (collection, tokenId, payToken) => {
      const auctionInDb = await getAuction(collection.toLowerCase(), tokenId);

      if (!auctionInDb) {
        const auctionInfo = await AUCTION_CONTRACT.getAuction(
          collection.toLowerCase(),
          tokenId
        );

        const doc = {
          collectionAddress: collection.toLowerCase(),
          tokenId: tokenId,
          payToken: payToken,
          reservePrice: formatEther(auctionInfo._reservePrice),
          buyNowPrice: formatEther(auctionInfo._buyNowPrice),
          owner: auctionInfo._owner,
          startTime: auctionInfo._startTime,
          endTime: auctionInfo._endTime,
        };

        await addNewAuction(doc);
        await registerAuctionCreated(
          collection.toLowerCase(),
          tokenId,
          auctionInfo._owner,
          formatEther(auctionInfo._reservePrice),
          payToken
        );

        const itemOffers = await getItemOffers(
          collection.toLowerCase(),
          tokenId
        );

        if (itemOffers.length > 0) {
          await Promise.all(
            itemOffers.map(async (offer) => {
              let cleanOfferTx = await MARKET_CONTRACT.cleanOffers(
                collection.toLowerCase(),
                tokenId,
                offer.creator
              );
              await cleanOfferTx.wait();
              await registerOfferCancelled(
                collection.toLowerCase(),
                tokenId,
                offer.creator
              );
            })
          );
        }
      }
    }
  );

  AUCTION_CONTRACT.on("AuctionCancelled", async (collection, tokenId) => {
    const auctionInfoinDb = await getAuction(collection.toLowerCase(), tokenId);
    await deleteAuction(collection.toLowerCase(), tokenId);
    await registerAuctionCanceled(
      collection.toLowerCase(),
      tokenId,
      auctionInfoinDb.owner
    );
  });

  AUCTION_CONTRACT.on(
    "UpdateAuctionReservePrice",
    async (collection, tokenId, payToken, reservePrice) => {
      const auctionInfo = await AUCTION_CONTRACT.getAuction(
        collection.toLowerCase(),
        tokenId
      );

      if (auctionInfo.owner !== ADDRESS_ZERO) {
        await updateReservePrice(
          collection.toLowerCase(),
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
        collection.toLowerCase(),
        tokenId
      );

      if (auctionInfo.owner !== ADDRESS_ZERO) {
        await updateStartTime(
          collection.toLowerCase(),
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
        collection.toLowerCase(),
        tokenId
      );

      if (auctionInfo.owner !== ADDRESS_ZERO) {
        await updateEndTime(
          collection.toLowerCase(),
          tokenId.toNumber(),
          endTime
        );
      }
    }
  );

  AUCTION_CONTRACT.on(
    "BidPlaced",
    async (collection, tokenId, bidder, bidAmount) => {
      const auctionInfo = await AUCTION_CONTRACT.getAuction(
        collection.toLowerCase(),
        tokenId
      );

      if (auctionInfo.owner !== ADDRESS_ZERO) {
        await registerBidCreated(
          collection.toLowerCase(),
          tokenId,
          bidder,
          auctionInfo._owner,
          formatEther(bidAmount),
          auctionInfo._payToken
        );
      }
    }
  );

  AUCTION_CONTRACT.on(
    "AuctionResulted",
    async (prevOwner, collection, tokenId, winner, payToken, winingBid) => {
      await deleteAuction(collection.toLowerCase(), tokenId);

      //Actualizar token Info

      await changeNftOwner(
        collection.toLowerCase(),
        tokenId.toNumber(),
        prevOwner,
        winner
      );

      const ERC721_CONTRACT = getERC721Contract(collection);
      const hasFreezedMetadata = await ERC721_CONTRACT.isFreezedMetadata(
        tokenId
      );
      if (!hasFreezedMetadata) {
        const uri = await ERC721_CONTRACT.uri(tokenId);
        const tx = await ERC721_CONTRACT.setFreezedMetadata(tokenId, uri);
        await tx.wait();
      }

      //Añadir eventos
      await registerAuctionCompleted(
        collection.toLowerCase(),
        tokenId,
        winner,
        formatEther(winingBid),
        payToken
      );
      await registerTransferEvent(
        collection.toLowerCase(),
        tokenId.toNumber(),
        prevOwner,
        winner,
        formatEther(winingBid),
        payToken
      );
    }
  );
};

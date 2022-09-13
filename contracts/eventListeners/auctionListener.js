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
  registerAuctionPriceChanged,
  registerBidCreated,
  registerOfferCancelled,
  registerTransferEvent,
} from "../../utils/events.js";
import {
  createHighestBidder,
  deleteHighestBidder,
  getHighestBidder,
  updateHighestBidder,
} from "../../utils/highestBidders.js";
import { addJsonToIpfs } from "../../utils/ipfs.js";
import { changeNftOwner, getNftInfo } from "../../utils/nfts.js";
import { createNotification } from "../../utils/notifications.js";
import { getItemOffers } from "../../utils/offers.js";
import {
  ADDRESS_ZERO,
  getAuctionContract,
  getERC721Contract,
  getMarketContract,
} from "../index.js";

export const listenToAuctionEvents = async () => {
  const AUCTION_CONTRACT = await getAuctionContract();
  const MARKET_CONTRACT = await getMarketContract();
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
        collection,
        tokenId
      );
      console.log(reservePrice);
      console.log(formatEther(reservePrice));
      if (auctionInfo._owner !== ADDRESS_ZERO) {
        await updateReservePrice(
          collection.toLowerCase(),
          tokenId.toNumber(),
          formatEther(reservePrice)
        );
        await registerAuctionPriceChanged(
          collection.toLowerCase(),
          tokenId,
          auctionInfo._owner,
          formatEther(reservePrice),
          payToken
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

      if (auctionInfo._owner !== ADDRESS_ZERO) {
        await registerBidCreated(
          collection.toLowerCase(),
          tokenId,
          bidder,
          auctionInfo._owner,
          formatEther(bidAmount),
          auctionInfo._payToken
        );

        const prevBidder = await getHighestBidder(
          collection.toLowerCase(),
          tokenId
        );
        if (prevBidder) {
          const notDoc = {
            type: "AUCTION",
            collectionAddress: collection.toLowerCase(),
            tokenId: tokenId.toNumber(),
            to: prevBidder.bidder,
            timestamp: new Date().toISOString(),
            params: {
              type: "BID INCREASED",
              price: parseFloat(formatEther(bidAmount)),
            },
            visible: true,
          };
          await createNotification(notDoc);
          await updateHighestBidder(
            collection.toLowerCase(),
            tokenId.toNumber(),
            bidder
          );
        } else {
          const highestBidderDoc = {
            collectionAddress: collection.toLowerCase(),
            tokenId: tokenId,
            bidder: bidder,
            bid: formatEther(bidAmount),
            payToken: auctionInfo._payToken,
          };
          await createHighestBidder(highestBidderDoc);
        }

        const notificationDoc = {
          type: "AUCTION",
          collectionAddress: collection.toLowerCase(),
          tokenId: tokenId.toNumber(),
          to: auctionInfo._owner,
          timestamp: new Date().toISOString(),
          params: {
            type: "BIDDED",
            price: parseFloat(formatEther(bidAmount)),
          },
          visible: true,
        };

        await createNotification(notificationDoc);
      }
    }
  );

  AUCTION_CONTRACT.on(
    "AuctionResulted",
    async (prevOwner, collection, tokenId, winner, payToken, winingBid) => {
      await deleteAuction(collection.toLowerCase(), tokenId);
      await deleteHighestBidder(collection.toLowerCase(), tokenId);

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
        const nftInfo = await getNftInfo(
          buyer,
          tokenId.toNumber(),
          collection.toLowerCase()
        );

        const data = {
          name: nftInfo.name,
          description: nftInfo.description,
          image: nftInfo.image,
          external_link: nftInfo.externalLink,
        };

        const ipfsCID = await addJsonToIpfs(data);

        const ipfsFileURL = `https://ipfs.io/ipfs/${ipfsCID.IpfsHash}`;

        const tx = await ERC721_CONTRACT.setFreezedMetadata(
          tokenId,
          ipfsFileURL
        );
        await tx.wait();

        const royaltiesTx = await MARKET_CONTRACT.registerRoyalty(
          nftInfo.creator,
          collection,
          tokenId.toNumber(),
          parseFloat(nftInfo.royalty) * 100
        );
        await royaltiesTx.wait();
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

      let notificationDoc = {
        type: "AUCTION",
        collectionAddress: collection.toLowerCase(),
        tokenId: tokenId.toNumber(),
        to: winner,
        timestamp: new Date().toISOString(),
        params: {
          type: "WINNED",
          price: parseFloat(formatEther(winingBid)),
        },
        visible: true,
      };

      await createNotification(notificationDoc);

      notificationDoc = {
        type: "AUCTION",
        collectionAddress: collection.toLowerCase(),
        tokenId: tokenId.toNumber(),
        to: prevOwner,
        timestamp: new Date().toISOString(),
        params: {
          type: "FINISHED",
          price: parseFloat(formatEther(winingBid)),
        },
        visible: true,
      };

      await createNotification(notificationDoc);
    }
  );
};

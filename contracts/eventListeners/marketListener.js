import { formatEther, parseEther } from "ethers/lib/utils.js";
import NftController from "../../controllers/NftsController.js";
import {
  registerChangePriceEvent,
  registerListingEvent,
  registerOfferAccepted,
  registerOfferCancelled,
  registerOfferCreated,
  registerOfferModified,
  registerTransferEvent,
  registerUnlistItem,
} from "../../utils/events.js";
import { getFavoriteItemForToken } from "../../utils/favoriteItem.js";
import { addJsonToIpfs } from "../../utils/ipfs.js";
import {
  changeNftOwner,
  getNftInfo,
  getNftInfoById,
} from "../../utils/nfts.js";
import {
  changePrice,
  createNftForSale,
  deleteNftForSale,
  getNftForSaleById,
} from "../../utils/nftsForSale.js";
import { createNotification } from "../../utils/notifications.js";
import {
  addNewOffer,
  deleteAcceptedOffer,
  deleteOffer,
  getItemOffers,
  getOffer,
  getOfferAccepted,
  updateOffer,
} from "../../utils/offers.js";
import { getProfileInfo } from "../../utils/profiles.js";
import {
  getWatchlist,
  getWatchlistForCollection,
} from "../../utils/watchlists.js";
import { gasStation } from "../address.js";
import {
  getERC721Contract,
  getMarketContract,
  getVerificationContract,
  managerWallet,
  WFTM_CONTRACT,
} from "../index.js";

export const listenToMarketEvents = async () => {
  //ITEMS
  const MARKET_CONTRACT = await getMarketContract();
  const VERIFICATION_CONTRACT = await getVerificationContract();
  MARKET_CONTRACT.on(
    "ItemListed",
    async (owner, collection, tokenId, payToken, price, startingTime) => {
      //Save ItemListed
      await registerListingEvent(
        collection.toLowerCase(),
        tokenId,
        owner,
        formatEther(price),
        payToken
      );

      //Get who has favorite item
      const favorites = await getFavoriteItemForToken(
        collection.toLowerCase(),
        tokenId
      );

      if (favorites.length > 0) {
        await Promise.all(
          favorites.map(async (fav) => {
            const notificationDoc = {
              type: "LISTING",
              collectionAddress: collection.toLowerCase(),
              tokenId: tokenId.toNumber(),
              to: fav.for,
              timestamp: new Date().toISOString(),
              params: {
                type: "FAV LISTED",
                price: parseFloat(formatEther(price)),
              },
              visible: true,
            };

            await createNotification(notificationDoc);
          })
        );
      }

      //Get watchlist
      const watchlists = await getWatchlistForCollection(
        collection.toLowerCase()
      );

      if (watchlists.length > 0) {
        await Promise.all(
          watchlists.map(async (fav) => {
            const notificationDoc = {
              type: "LISTING",
              collectionAddress: collection.toLowerCase(),
              tokenId: tokenId.toNumber(),
              to: fav.for,
              timestamp: new Date().toISOString(),
              params: {
                type: "COL LISTED",
                price: parseFloat(formatEther(price)),
              },
              visible: true,
            };

            await createNotification(notificationDoc);
          })
        );
      }
    }
  );
  MARKET_CONTRACT.on(
    "ItemSold",
    async (
      seller,
      buyer,
      collection,
      tokenId,
      payToken,
      price,
      marketFee,
      royaltyFee
    ) => {
      //Save ItemSold
      try {
        const updatedOwner = await changeNftOwner(
          collection.toLowerCase(),
          tokenId.toNumber(),
          seller,
          buyer
        );
        const nftInfo = await getNftInfo(
          buyer,
          tokenId.toNumber(),
          collection.toLowerCase()
        );
        const ERC721_CONTRACT = getERC721Contract(collection);
        const hasFreezedMetadata = await ERC721_CONTRACT.isFreezedMetadata(
          tokenId
        );
        if (!hasFreezedMetadata) {
          const tx = await ERC721_CONTRACT.setFreezedMetadata(
            tokenId,
            nftInfo.ipfsMetadata
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
        const verificated = await VERIFICATION_CONTRACT.checkIfVerifiedInversor(
          buyer
        );
        if (!verificated) {
          const verifyTx = await VERIFICATION_CONTRACT.verificateInversor(
            buyer
          );
          await verifyTx.wait();
        }

        if (updatedOwner) {
          const royaltyFeeFormatted = formatEther(royaltyFee);
          const finalPrice = price.sub(marketFee).sub(royaltyFee);

          const priceTx = await WFTM_CONTRACT.withdrawByAdmin(
            finalPrice,
            seller
          );
          await priceTx.wait();

          if (royaltyFeeFormatted > 0) {
            const royatyFeeTx = await WFTM_CONTRACT.withdrawByAdmin(
              royaltyFee,
              nftInfo.creator
            );
            await royatyFeeTx.wait();
          }

          const marketFeeTx = await WFTM_CONTRACT.withdrawByAdmin(
            marketFee,
            managerWallet.address
          );
          await marketFeeTx.wait();

          const formattedMarketFee = formatEther(marketFee);
          const feeForStation = (formattedMarketFee / 100) * 2;

          console.log("fee for station", feeForStation);
          const sendToGasToGasStation = {
            from: managerWallet.address,
            to: gasStation,
            value: parseEther(feeForStation.toString()),
          };

          const tx = await managerWallet.sendTransaction(sendToGasToGasStation);
          await tx.wait();
          console.log("DONE sending station");

          const notificationDoc = {
            type: "TRANSFER",
            collectionAddress: collection.toLowerCase(),
            tokenId: tokenId.toNumber(),
            to: seller,
            timestamp: new Date().toISOString(),
            params: {
              type: "SOLD",
              price: parseFloat(formatEther(price)),
            },
            visible: true,
          };

          await createNotification(notificationDoc);

          const offerAccepted = await getOfferAccepted(
            collection.toLowerCase(),
            tokenId
          );

          if (offerAccepted) {
            const offerNotificationDoc = {
              type: "OFFER",
              collectionAddress: collection.toLowerCase(),
              tokenId: tokenId.toNumber(),
              to: offerAccepted.creator,
              timestamp: new Date().toISOString(),
              params: {
                type: "ACCEPTED",
                price: parseFloat(formatEther(price)),
              },
              visible: true,
            };

            await createNotification(offerNotificationDoc);
            await registerOfferAccepted(
              collection.toLowerCase(),
              tokenId,
              seller,
              buyer,
              formatEther(price),
              payToken
            );
          }

          await registerTransferEvent(
            collection.toLowerCase(),
            tokenId,
            seller,
            buyer,
            formatEther(price),
            payToken
          );
          console.log("ItemSold");
        }

        //Clean offers

        const itemOffers = await getItemOffers(
          collection.toLowerCase(),
          tokenId
        );

        if (itemOffers.length > 0) {
          await Promise.all(
            itemOffers.map(async (offer) => {
              await deleteOffer(
                collection.toLowerCase(),
                tokenId,
                offer.creator
              );
              await deleteAcceptedOffer(
                collection.toLowerCase(),
                tokenId,
                offer.creator
              );
              let cleanOfferTx = await MARKET_CONTRACT.cleanOffers(
                collection,
                tokenId,
                offer.creator
              );
              await cleanOfferTx.wait();
            })
          );
        }

        //Aprove Item
      } catch (e) {
        console.log(e);
      }
    }
  );
  MARKET_CONTRACT.on(
    "ItemUpdated",
    async (owner, collection, tokenId, payToken, newPrice) => {
      const eventRegistered = await registerChangePriceEvent(
        collection.toLowerCase(),
        tokenId.toNumber(),
        owner,
        formatEther(newPrice),
        payToken
      );

      console.log("Updated Item");
    }
  );
  MARKET_CONTRACT.on("ItemCanceled", async (owner, collection, tokenId) => {
    //Save ItemUpdated

    const registeredEvent = await registerUnlistItem(
      collection.toLowerCase(),
      tokenId,
      owner
    );
  });
  //OFFERS
  MARKET_CONTRACT.on(
    "OfferCreated",
    async (creator, collection, tokenId, payToken, price, deadline) => {
      const offer = await getOffer(collection.toLowerCase(), tokenId, creator);

      if (!offer) {
        const doc = {
          creator: creator,
          collectionAddress: collection.toLowerCase(),
          tokenId: tokenId,
          payToken: payToken,
          price: formatEther(price),
          deadline: deadline,
        };

        const nftInfo = await getNftInfoById(tokenId, collection.toLowerCase());

        await addNewOffer(doc);

        const receptor = await getProfileInfo(nftInfo.owner);

        await registerOfferCreated(
          collection.toLowerCase(),
          tokenId,
          creator,
          nftInfo.owner,
          formatEther(price),
          payToken
        );

        const notificationDoc = {
          type: "OFFER",
          collectionAddress: collection.toLowerCase(),
          tokenId: tokenId.toNumber(),
          to: receptor.wallet,
          timestamp: new Date().toISOString(),
          params: {
            type: "RECIEVED",
            price: parseFloat(formatEther(price)),
          },
          visible: true,
        };

        await createNotification(notificationDoc);

        console.log("OFFER CREATED");
      }
    }
  );
  MARKET_CONTRACT.on(
    "OfferModified",
    async (creator, collection, tokenId, payToken, price, deadline) => {
      const offer = await getOffer(collection.toLowerCase(), tokenId, creator);

      if (offer) {
        await updateOffer(
          creator,
          collection.toLowerCase(),
          tokenId.toNumber(),
          payToken,
          formatEther(price),
          deadline
        );

        const nftInfo = await getNftInfoById(tokenId, collection.toLowerCase());
        const receptor = await getProfileInfo(nftInfo.owner);

        await registerOfferModified(
          collection.toLowerCase(),
          tokenId,
          creator,
          nftInfo.owner,
          formatEther(price),
          payToken
        );

        const notificationDoc = {
          type: "OFFER",
          collectionAddress: collection.toLowerCase(),
          tokenId: tokenId.toNumber(),
          to: receptor.wallet,
          timestamp: new Date().toISOString(),
          params: {
            type: "MODIFIED",
            price: parseFloat(formatEther(price)),
          },
          visible: true,
        };

        await createNotification(notificationDoc);

        console.log("OFFER MODIFIED");
      }
    }
  );
  MARKET_CONTRACT.on("OfferCanceled", async (creator, collection, tokenId) => {
    const offerInfo = await getOffer(
      collection.toLowerCase(),
      tokenId.toNumber(),
      creator
    );
    const nftInfo = await getNftInfoById(tokenId, collection.toLowerCase());

    if (offerInfo) {
      await deleteOffer(collection.toLowerCase(), tokenId.toNumber(), creator);
      await registerOfferCancelled(
        collection.toLowerCase(),
        tokenId,
        creator,
        nftInfo.owner
      );
    }
  });
};

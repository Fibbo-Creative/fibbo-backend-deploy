import { formatEther } from "ethers/lib/utils.js";
import NftController from "../../controllers/NftsController.js";
import {
  registerChangePriceEvent,
  registerListingEvent,
  registerOfferCancelled,
  registerOfferCreated,
  registerTransferEvent,
  registerUnlistItem,
} from "../../utils/events.js";
import { changeNftOwner, getNftInfo } from "../../utils/nfts.js";
import {
  changePrice,
  createNftForSale,
  deleteNftForSale,
  getNftForSaleById,
} from "../../utils/nftsForSale.js";
import {
  addNewOffer,
  deleteOffer,
  getItemOffers,
  getOffer,
} from "../../utils/offers.js";
import { MARKET_CONTRACT, VERIFICATION_CONTRACT } from "../index.js";

export const listenToMarketEvents = () => {
  //ITEMS
  MARKET_CONTRACT.on(
    "ItemListed",
    async (owner, collection, tokenId, payToken, price, startingTime) => {
      //Save ItemListed
      const nftForSaleInfo = await getNftForSaleById(
        collection,
        tokenId.toNumber()
      );
      if (nftForSaleInfo) {
      } else {
        const nftInfo = await getNftInfo(owner, tokenId.toNumber(), collection);
        if (nftInfo) {
          const doc = {
            name: nftInfo.name,
            image: nftInfo.image,
            tokenId: tokenId,
            collectionAddress: collection,
            price: formatEther(price),
            owner: owner,
            forSaleAt: new Date().toISOString(),
            payToken: payToken,
          };

          const createdDoc = await createNftForSale(doc);

          await registerListingEvent(
            collection,
            tokenId,
            owner,
            formatEther(price),
            payToken
          );
        }
      }
    }
  );
  MARKET_CONTRACT.on(
    "ItemSold",
    async (seller, buyer, collection, tokenId, payToken, price) => {
      //Save ItemSold

      const updatedOwner = await changeNftOwner(
        collection,
        tokenId.toNumber(),
        seller,
        buyer
      );

      const verificated = await VERIFICATION_CONTRACT.checkIfVerifiedInversor(
        buyer
      );
      if (!verificated) {
        const verifyTx = await VERIFICATION_CONTRACT.verificateInversor(buyer);
        await verifyTx.wait();
      }

      if (updatedOwner) {
        const deletedNftForSale = await deleteNftForSale(collection, tokenId);

        const eventCreated = await registerTransferEvent(
          collection,
          tokenId,
          seller,
          buyer,
          formatEther(price),
          payToken
        );

        console.log("ItemSold");
      }

      //Clean offers

      const itemOffers = await getItemOffers(collection, tokenId);

      if (itemOffers.length > 0) {
        await Promise.all(
          itemOffers.map(async (offer) => {
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
    }
  );
  MARKET_CONTRACT.on(
    "ItemUpdated",
    async (owner, collection, tokenId, payToken, newPrice) => {
      const updatedListing = await changePrice(
        collection,
        tokenId.toNumber(),
        owner,
        formatEther(newPrice)
      );

      const eventRegistered = await registerChangePriceEvent(
        collection,
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

    const nftForSaleInfo = await getNftForSaleById(
      collection,
      tokenId.toNumber()
    );
    if (nftForSaleInfo) {
      const deletedItem = await deleteNftForSale(collection, tokenId);

      const registeredEvent = await registerUnlistItem(
        collection,
        tokenId,
        owner
      );

      console.log("ITEM UNLISTED");
    }
  });
  //OFFERS
  MARKET_CONTRACT.on(
    "OfferCreated",
    async (creator, collection, tokenId, payToken, price, deadline) => {
      const offer = await getOffer(collection, tokenId, creator);

      if (!offer) {
        const doc = {
          creator: creator,
          collectionAddress: collection,
          tokenId: tokenId,
          payToken: payToken,
          price: formatEther(price),
          deadline: deadline,
        };

        await addNewOffer(doc);

        await registerOfferCreated(
          collection,
          tokenId,
          creator,
          formatEther(price),
          payToken
        );
        console.log("OFFER CREATED");
      }
    }
  );
  MARKET_CONTRACT.on("OfferCanceled", async (creator, collection, tokenId) => {
    const offerInfo = await getOffer(collection, tokenId.toNumber(), creator);

    if (offerInfo) {
      await deleteOffer(collection, tokenId.toNumber(), creator);
      await registerOfferCancelled(collection, tokenId, creator);
    }
  });
};

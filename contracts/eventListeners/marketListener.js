import { formatEther } from "ethers/lib/utils.js";
import NftController from "../../controllers/NftsController.js";
import {
  registerChangePriceEvent,
  registerListingEvent,
  registerOfferCancelled,
  registerOfferCreated,
  registerOfferModified,
  registerTransferEvent,
  registerUnlistItem,
} from "../../utils/events.js";
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
import {
  addNewOffer,
  deleteOffer,
  getItemOffers,
  getOffer,
  updateOffer,
} from "../../utils/offers.js";
import {
  getERC721Contract,
  MARKET_CONTRACT,
  VERIFICATION_CONTRACT,
} from "../index.js";

export const listenToMarketEvents = () => {
  //ITEMS
  MARKET_CONTRACT.on(
    "ItemListed",
    async (owner, collection, tokenId, payToken, price, startingTime) => {
      //Save ItemListed
      console.log("LISTING");
      await registerListingEvent(
        collection.toLowerCase(),
        tokenId,
        owner,
        formatEther(price),
        payToken
      );
    }
  );
  MARKET_CONTRACT.on(
    "ItemSold",
    async (seller, buyer, collection, tokenId, payToken, price) => {
      //Save ItemSold

      const updatedOwner = await changeNftOwner(
        collection.toLowerCase(),
        tokenId.toNumber(),
        seller,
        buyer
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
      }
      const verificated = await VERIFICATION_CONTRACT.checkIfVerifiedInversor(
        buyer
      );
      if (!verificated) {
        const verifyTx = await VERIFICATION_CONTRACT.verificateInversor(buyer);
        await verifyTx.wait();
      }

      if (updatedOwner) {
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

      const itemOffers = await getItemOffers(collection.toLowerCase(), tokenId);

      if (itemOffers.length > 0) {
        await Promise.all(
          itemOffers.map(async (offer) => {
            console.log(offer.creator);
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

        await addNewOffer(doc);

        await registerOfferCreated(
          collection.toLowerCase(),
          tokenId,
          creator,
          formatEther(price),
          payToken
        );
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

        await registerOfferModified(
          collection.toLowerCase(),
          tokenId,
          creator,
          formatEther(price),
          payToken
        );
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
    console.log("CANCEL OFFER");
    console.log(collection, tokenId.toNumber(), creator);

    console.log(offerInfo);

    if (offerInfo) {
      await deleteOffer(collection.toLowerCase(), tokenId.toNumber(), creator);
      await registerOfferCancelled(collection.toLowerCase(), tokenId, creator);
    }
  });
};

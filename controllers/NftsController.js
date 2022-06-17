import { nftColectionAddress } from "../contracts/address.js";
import { MARKET_CONTRACT } from "../contracts/index.js";
import Nft from "../models/nft.js";
import NftForSale from "../models/nftForSale.js";
import { getCollectionInfo, updateTotalNfts } from "../utils/collections.js";
import {
  formatHistory,
  getEventsFromNft,
  registerChangePriceEvent,
  registerListingEvent,
  registerMintEvent,
  registerTransferEvent,
  registerUnlistItem,
} from "../utils/events.js";
import {
  changeNftOwner,
  createNft,
  filterItemsByTitle,
  getAllNfts,
  getNftInfo,
  getNftInfoById,
  getNftsByAddress,
} from "../utils/nfts.js";
import {
  changePrice,
  createNftForSale,
  deleteNftForSale,
  getAllNftsForSale,
  getNftForSaleById,
} from "../utils/nftsForSale.js";

export default class NftController {
  constructor() {}

  //GET
  static async getAllNfts(req, res) {
    try {
      const allNfts = await getAllNfts();
      const allNftsForSale = await getAllNftsForSale();

      let tokenIds = [];
      let finalList = [];
      allNftsForSale.forEach((_nftForSaleItem) => {
        if (!tokenIds.includes(_nftForSaleItem.tokenId)) {
          tokenIds.push(_nftForSaleItem.tokenId);
          finalList.push(_nftForSaleItem);
        }
      });

      allNfts.forEach((_nftItem) => {
        if (!tokenIds.includes(_nftItem.tokenId)) {
          tokenIds.push(_nftItem.tokenId);
          finalList.push(_nftItem);
        }
      });
      res.status(200).send(finalList);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async getNftsForSale(req, res) {
    try {
      const allNftsForSale = await getAllNftsForSale();

      let formatted = await Promise.all(
        allNftsForSale.map(async (item) => {
          const nftId = item.tokenId;
          const collection = item.collectionAddress;

          const nftInfo = await Nft.findOne({
            tokenId: nftId,
            collectionAddress: collection,
          });
          return {
            ...item._doc,
            createdAt: nftInfo.createdAt,
          };
        })
      );

      res.status(200).send(formatted);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async getNftInfoById(req, res) {
    try {
      const { collection, nftId } = req.query;

      if (!nftId) {
        res.status(204).send("No identifier supplied");
      }

      const nft = await getNftInfoById(nftId, collection);
      if (nft) {
        const nftForSale = await getNftForSaleById(collection, nftId);
        console.log(nft);
        let nftResult = nft;
        if (nftForSale) {
          nftResult = {
            ...nft,
            forSale: true,
            price: nftForSale.price,
            forSaleAt: nftForSale.forSaleAt,
          };
        } else {
          nftResult = {
            ...nft,
            forSale: false,
          };
        }
        res.status(200).send(nftResult);
      } else {
        res.status(205).send("Nft with id not found!");
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async getNftsByAddress(req, res) {
    try {
      const { address } = req.query;

      if (!address) {
        res.status(204).send("No address supplied");
      }

      const nfts = await getNftsByAddress(address);

      res.status(200).send(nfts);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async getItemHistory(req, res) {
    try {
      const { collection, tokenId } = req.query;

      const result = await getEventsFromNft(collection, tokenId);
      const formattedResult = await formatHistory(result);

      res.status(200).send(formattedResult);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  //POST
  static async newItem(req, res) {
    try {
      const {
        collection,
        name,
        description,
        creator,
        tokenId,
        royalty,
        sanityImgUrl,
        additionalContent,
      } = req.body;

      const collectionInfo = await getCollectionInfo(collection);

      if (collectionInfo) {
        let doc = {
          name: name,
          description: description,
          owner: creator,
          creator: creator,
          tokenId: parseInt(tokenId),
          royalty: parseFloat(royalty),
          image: sanityImgUrl,
          collectionAddress: collection,
          createdAt: new Date().toISOString(),
        };
        if (additionalContent) {
          doc = {
            ...doc,
            additionalContent: additionalContent,
          };
        }
        const newNft = await createNft(doc);

        const tx = await MARKET_CONTRACT.registerRoyalty(
          creator,
          nftColectionAddress,
          parseInt(tokenId),
          parseFloat(royalty) * 100
        );

        tx.wait(1);

        await updateTotalNfts(collection, collectionInfo.numberOfItems);

        if (newNft) {
          res.status(200).send(newNft);

          await registerMintEvent(collection, tokenId, creator);
        }
      } else {
        res.send("No collection Found");
      }
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async putForSale(req, res) {
    try {
      const { collectionAddress, tokenId, owner, price } = req.body;
      if (!tokenId || !owner || !price) {
        res.status(204).send("No params supplied");
      }

      const nft = await getNftInfo(owner, tokenId, collectionAddress);

      if (nft) {
        const doc = {
          name: nft.name,
          image: nft.image,
          tokenId: tokenId,
          collectionAddress: collectionAddress,
          price: price,
          owner: owner,
          forSaleAt: new Date().toISOString(),
        };

        const createdDoc = await createNftForSale(doc);

        await registerListingEvent(collectionAddress, tokenId, owner, price);
        res.status(200).send(createdDoc);
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async nftBought(req, res) {
    try {
      const { prevOwner, newOwner, boughtFor, tokenId, collectionAddress } =
        req.body;
      if (
        !prevOwner ||
        !newOwner ||
        !boughtFor ||
        !tokenId ||
        !collectionAddress
      ) {
        res.status(204).send("No params supplied");
      }

      const updatedOwner = await changeNftOwner(
        collectionAddress,
        tokenId,
        prevOwner,
        newOwner
      );

      if (updatedOwner) {
        const deletedNftForSale = await deleteNftForSale(
          collectionAddress,
          tokenId
        );

        const eventCreated = await registerTransferEvent(
          collectionAddress,
          tokenId,
          prevOwner,
          newOwner,
          boughtFor
        );

        res.status(200).send(eventCreated);
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async changePrice(req, res) {
    try {
      const { collectionAddress, newPrice, owner, tokenId } = req.body;

      const updatedListing = await changePrice(
        collectionAddress,
        tokenId,
        owner,
        newPrice
      );

      const eventRegistered = await registerChangePriceEvent(
        collectionAddress,
        tokenId,
        owner,
        newPrice
      );

      if (updatedListing) {
        res.status(200).send("Item updated succesfully");
      } else {
        res.status(204).send("Error updating item");
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async unlistItem(req, res) {
    try {
      const { collectionAddress, owner, tokenId } = req.body;
      const deletedItem = await deleteNftForSale(collectionAddress, tokenId);

      const registeredEvent = await registerUnlistItem(
        collectionAddress,
        tokenId,
        owner
      );
      if (deletedItem) {
        res.status(200).send("Item deleted succesfully");
      } else {
        res.status(204).send("Error deleting item");
      }
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
}

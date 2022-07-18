import { nftColectionAddress } from "../contracts/address.js";
import { MARKET_CONTRACT, VERIFICATION_CONTRACT } from "../contracts/index.js";
import Nft from "../models/nft.js";
import NftForSale from "../models/nftForSale.js";
import { getCollectionInfo, updateTotalNfts } from "../utils/collections.js";
import {
  formatHistory,
  getAllTransfers,
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

  static async getAllTransfers(req, res) {
    try {
      const result = await getAllTransfers();
      res.status(200).send(result.toString());
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
}

import { formatEther } from "ethers/lib/utils.js";
import { nftColectionAddress } from "../contracts/address.js";
import {
  ADDRESS_ZERO,
  AUCTION_CONTRACT,
  MARKET_CONTRACT,
  VERIFICATION_CONTRACT,
} from "../contracts/index.js";
import Nft from "../models/nft.js";
import NftForSale from "../models/nftForSale.js";
import offers from "../models/offers.js";
import ethers from "ethers";
import {
  getCollectionInfo,
  getItemsFromCollection,
  updateTotalNfts,
} from "../utils/collections.js";
import {
  formatHistory,
  getAllTransfers,
  getEventsFromNft,
  getEventsFromWallet,
  registerMintEvent,
} from "../utils/events.js";
import {
  changeNftInfo,
  changeNftOwner,
  createNft,
  filterItemsByTitle,
  getAllNfts,
  getAllNftsInfo,
  getNftInfo,
  getNftInfoById,
  getNftsByAddress,
  getNftsByCreator,
  setFreezedMetadata,
} from "../utils/nfts.js";
import {
  changePrice,
  createNftForSale,
  deleteNftForSale,
  getAllNftsForSale,
  getNftForSaleById,
} from "../utils/nftsForSale.js";
import {
  formatOffers,
  getItemOffers,
  getOffersFromWallet,
  sortHigherOffer,
} from "../utils/offers.js";
import { getPayTokenInfo } from "../utils/payTokens.js";

export default class NftController {
  constructor() {}

  //GET
  static async getAllNfts(req, res) {
    try {
      const { count } = req.query;
      const allNfts = await getAllNfts(count);
      let formatted = await getAllNftsInfo(allNfts);
      res.status(200).send(formatted);
    } catch (e) {
      console.log(e);
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

      let collectionAddress = collection;
      if (!collection.includes("0x")) {
        const collectionInfo = await getCollectionInfo(collection);
        collectionAddress = collectionInfo.contractAddress;
      }

      const nft = await getNftInfoById(nftId, collectionAddress);
      if (nft) {
        let nftResult = {
          nftData: nft,
        };

        let listingInfo = await MARKET_CONTRACT.listings(
          collectionAddress,
          ethers.BigNumber.from(nftId),
          nft.owner
        );

        listingInfo = {
          payToken: listingInfo.payToken,
          price: parseFloat(formatEther(listingInfo.price)),
          startingTime: new Date(listingInfo.startingTime * 1000),
        };

        if (listingInfo.price !== 0) {
          const payTokenInfo = await getPayTokenInfo(listingInfo.payToken);
          nftResult = {
            ...nftResult,
            listing: {
              forSale: true,
              price: listingInfo.price,
              forSaleAt: listingInfo.forSaleAt,
              payToken: payTokenInfo,
            },
          };
        } else {
          nftResult = {
            ...nftResult,
          };
        }

        //Get offers
        let offers = await getItemOffers(collectionAddress, nftId);
        offers = await formatOffers(offers);
        nftResult = {
          ...nftResult,
          offers: offers,
        };

        //Get history
        let history = await getEventsFromNft(collectionAddress, nftId);
        history = await formatHistory(history);
        nftResult = {
          ...nftResult,
          history: history,
        };

        //Get more from collection
        let items = await getItemsFromCollection(collectionAddress);
        nftResult = {
          ...nftResult,
          nfts: items.filter((item) => item.tokenId !== parseFloat(nftId)),
        };

        res.status(200).send(nftResult);
      } else {
        res.status(205).send("Nft with id not found!");
      }
    } catch (e) {
      console.log(e);
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

      let formatted = await getAllNftsInfo(nfts);
      res.status(200).send(formatted);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async getNftsByCreator(req, res) {
    try {
      const { address } = req.query;

      if (!address) {
        res.status(204).send("No address supplied");
      }

      const nfts = await getNftsByCreator(address);

      let formatted = await getAllNftsInfo(nfts);
      res.status(200).send(formatted);
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

  static async getWalletHistory(req, res) {
    try {
      const { address } = req.query;

      const result = await getEventsFromWallet(address);
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
        ipfsImgUrl,
        ipfsMetadataUrl,
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
          ipfsImage: ipfsImgUrl,
          ipfsMetadata: ipfsMetadataUrl,
          collectionAddress: collection,
          hasFreezedMetadata: false,
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

  static async updateNft(req, res) {
    try {
      const {
        collection,
        name,
        description,
        creator,
        tokenId,
        royalty,
        sanityImgUrl,
        ipfsImageUrl,
        ipfsMetadataUrl,
        additionalContent,
      } = req.body;

      const collectionInfo = await getCollectionInfo(collection);

      const nftData = await getNftInfoById(tokenId, collection);
      if (nftData) {
        if (collectionInfo) {
          if (additionalContent) {
            doc = {
              ...doc,
              additionalContent: additionalContent,
            };
          }

          await changeNftInfo(
            collection,
            tokenId,
            name,
            description,
            royalty,
            sanityImgUrl,
            ipfsImageUrl,
            ipfsMetadataUrl
          );
          res.status(200).send("Edited");
        } else {
          res.stauts(204).send("No collection Found");
        }
      } else {
        res.stauts(204).send("No Item Found");
      }
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async registerRoyalties(req, res) {
    try {
      const { collection, tokenId, royalty } = req.body;

      const collectionInfo = await getCollectionInfo(collection);

      if (collectionInfo) {
        const tx = await MARKET_CONTRACT.registerRoyalty(
          creator,
          collectionInfo.contractAddress,
          parseInt(tokenId),
          parseFloat(royalty) * 100
        );

        tx.wait(1);

        await setFreezedMetadata(
          creator,
          collectionInfo.contractAddress,
          tokenId
        );
      } else {
        res.send("No collection Found");
      }
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
}

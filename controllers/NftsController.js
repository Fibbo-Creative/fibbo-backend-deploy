import { formatEther } from "ethers/lib/utils.js";
import { getERC721Contract, getMarketContract } from "../contracts/index.js";
import Nft from "../models/nft.js";
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
  registerTransferEvent,
} from "../utils/events.js";
import {
  changeNftInfo,
  changeNftOwner,
  createNft,
  deleteNftItem,
  getAllNfts,
  getAllNftsInfo,
  getNftInfoById,
  getNftsByAddress,
  getNftsByCreator,
  setFreezedMetadata,
} from "../utils/nfts.js";
import { getAllNftsForSale } from "../utils/nftsForSale.js";
import { formatOffers, getItemOffers } from "../utils/offers.js";
import { getPayTokenInfo } from "../utils/payTokens.js";
import { addJsonToIpfs } from "../utils/ipfs.js";
import {
  createFavoriteItem,
  deleteFavoriteItem,
  getFavoriteItem,
  getFavoriteItemForToken,
} from "../utils/favoriteItem.js";
import { getAllCategories, getCategoryInfo } from "../utils/categories.js";

export default class NftController {
  constructor() {}

  //GET
  static async getAllNfts(req, res) {
    try {
      const { count, user } = req.query;
      const allNfts = await getAllNfts(count);

      let formatted = await getAllNftsInfo(allNfts, user);
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
      const MARKET_CONTRACT = await getMarketContract();
      const { collection, nftId, user } = req.query;

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
          nftId,
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

        let favoritesItem = await getFavoriteItemForToken(
          nft.collectionAddress,
          nft.tokenId
        );

        nftResult = {
          ...nftResult,
          favorites: favoritesItem.length,
        };

        let favorited = favoritesItem.find((fav) => fav.for === user);
        if (favorited) {
          nftResult = {
            ...nftResult,
            isFavorited: true,
          };
        }

        const formattedCattegories = [];
        await Promise.all(
          nft.categories.map(async (cat) => {
            const categoryInfo = await getCategoryInfo(cat);
            formattedCattegories.push(categoryInfo);
          })
        );

        nftResult = {
          ...nftResult,
          categories: formattedCattegories,
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

  static async getCategories(req, res) {
    try {
      const result = await getAllCategories();
      res.status(200).send(result);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async getCategoriesDetail(req, res) {
    try {
      const { categories } = req.query;
      console.log(categories);
      //const result = await getAllCategories();
      res.status(200).send("OK");
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
        externalLink,
        sanityFileURL,
        ipfsImgUrl,
        ipfsMetadataUrl,
        additionalContent,
        categories,
        contentType,
        sanityAudioURL,
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
          ipfsImage: ipfsImgUrl,
          ipfsMetadata: ipfsMetadataUrl,
          collectionAddress: collection,
          hasFreezedMetadata: false,
          externalLink: externalLink,
          createdAt: new Date().toISOString(),
          categories: categories,
          contentType: contentType,
        };
        if (additionalContent) {
          doc = {
            ...doc,
            additionalContent: additionalContent,
          };
        }

        if (contentType === "IMG") {
          doc = {
            ...doc,
            image: sanityFileURL,
          };
        }

        if (contentType === "VIDEO") {
          doc = {
            ...doc,
            video: sanityFileURL,
          };
        }

        if (contentType === "AUDIO") {
          doc = {
            ...doc,
            audio: sanityAudioURL,
            image: sanityFileURL,
          };
        }

        const newNft = await createNft(doc);

        const MARKET_CONTRACT = await getMarketContract();

        const tx = await MARKET_CONTRACT.registerRoyalty(
          creator,
          collection,
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
        externalLink,
        additionalContent,
        categories,
      } = req.body;

      const collectionInfo = await getCollectionInfo(collection);

      const nftData = await getNftInfoById(tokenId, collection);
      if (nftData) {
        if (collectionInfo) {
          await changeNftInfo(
            collection,
            tokenId,
            name,
            description,
            royalty,
            sanityImgUrl,
            ipfsImageUrl,
            ipfsMetadataUrl,
            externalLink,
            additionalContent,
            categories
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
      const MARKET_CONTRACT = await getMarketContract();
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

  static async deleteItem(req, res) {
    try {
      const { collection, tokenId } = req.body;
      const deleted = await deleteNftItem(collection, tokenId);
      res.status(200).send("DELETED");
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async sentItem(req, res) {
    try {
      const { collection, tokenId, from, to } = req.body;

      const nftInfo = await getNftInfoById(tokenId, collection);

      if (nftInfo) {
        await changeNftOwner(collection.toLowerCase(), tokenId, from, to);
        await registerTransferEvent(collection, tokenId, from, to, 0, "");

        const ERC721_CONTRACT = getERC721Contract(collection);
        let isFreezedMetadata = await ERC721_CONTRACT.isFreezedMetadata(
          tokenId
        );

        if (!isFreezedMetadata) {
          const MARKET_CONTRACT = await getMarketContract();
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
            tokenId,
            parseFloat(nftInfo.royalty) * 100
          );
          await royaltiesTx.wait();
        }
        //set freezed metadata!

        res.status(200).send("Sent");
      } else {
        res.status(200).send("Item dont exist");
      }

      //Update owner

      //Register transfer event
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async addFavorite(req, res) {
    try {
      const { collection, tokenId, from } = req.body;

      const doc = {
        collectionAddress: collection,
        tokenId: tokenId,
        for: from,
      };

      const favorite = await createFavoriteItem(doc);
      res.status(200).send(favorite);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async deleteFavorite(req, res) {
    try {
      const { collection, tokenId, from } = req.body;
      const favorite = await getFavoriteItem(collection, tokenId, from);
      if (favorite) {
        await deleteFavoriteItem(collection, tokenId, from);
        res.status(200).send("DELETED");
      } else {
        res.status(205).send("Not found favorite");
      }
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
}

import { FACTORY_CONTRACT } from "../contracts/index.js";
import {
  createCollection,
  editCollection,
  getCollectionByName,
  getCollectionByUrl,
  getCollectionInfo,
  getCollectionsAvailable,
  getCollectionsFromOwner,
  getItemsFromCollection,
} from "../utils/collections.js";
import { getAllNftsInfo } from "../utils/nfts.js";
import { uploadToCDN } from "../utils/sanity.js";

export default class CollectionController {
  constructor() {}

  static async getCollectionData(req, res) {
    try {
      const { collection } = req.query;
      const collectionInfo = await getCollectionInfo(collection);
      if (collectionInfo) {
        res.status(200).send(collectionInfo);
      } else {
        res.status(204).send("Collection not found");
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async getCollectionDetails(req, res) {
    try {
      const { collection } = req.query;
      const collectionInfo = await getCollectionInfo(collection);

      const nftsFromCol = await getItemsFromCollection(
        collectionInfo.contractAddress
      );

      const formatted = await getAllNftsInfo(nftsFromCol);
      const result = {
        ...collectionInfo._doc,
        nfts: formatted,
      };
      if (collectionInfo) {
        res.status(200).send(result);
      } else {
        res.status(204).send("Collection not found");
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async getCollections(req, res) {
    try {
      const { owner } = req.query;
      const collections = await getCollectionsAvailable(owner);
      res.status(200).send(collections);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async getCollectionsFromOwner(req, res) {
    try {
      const { owner } = req.query;
      const collections = await getCollectionsFromOwner(owner);
      res.status(200).send(collections);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async checkUrl(req, res) {
    try {
      const { customURL } = req.query;
      const collection = await getCollectionByUrl(customURL);

      if (collection) {
        res.status(205).send("URL in use");
      } else {
        res.status(200).send(collection);
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async checkName(req, res) {
    try {
      const { name } = req.query;
      const collection = await getCollectionByName(name);

      if (collection) {
        res.status(205).send("Name in use");
      } else {
        res.status(200).send(collection);
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }

  //POST

  static async saveCollectionDetails(req, res) {
    try {
      const {
        contractAddress,
        creator,
        name,
        description,
        logoImage,
        featuredImage,
        bannerImage,
        customURL,
        websiteURL,
        discordURL,
        telegramURL,
        instagramURL,
      } = req.body;

      const doc = {
        contractAddress,
        creator,
        name,
        description,
        logoImage,
        featuredImage,
        bannerImage,
        customURL,
        websiteURL,
        discordURL,
        telegramURL,
        instagramURL,
        numberOfItems: 0,
      };
      const createdCollection = await createCollection(doc);
      res.status(200).send(createdCollection);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async editCollection(req, res) {
    try {
      const {
        contractAddress,
        creator,
        name,
        description,
        logoImage,
        featuredImage,
        bannerImage,
        customURL,
        websiteURL,
        discordURL,
        telegramURL,
        instagramURL,
      } = req.body;

      const createdCollection = await editCollection(
        contractAddress,
        creator,
        name,
        description,
        logoImage,
        featuredImage,
        bannerImage,
        customURL,
        websiteURL,
        discordURL,
        telegramURL,
        instagramURL
      );
      res.status(200).send(createdCollection);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
}

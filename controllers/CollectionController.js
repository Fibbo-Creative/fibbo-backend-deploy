import {
  createCollection,
  editCollection,
  getCollectionByName,
  getCollectionByUrl,
  getCollectionInfo,
  getCollectionsAvailable,
  getCollectionsFromOwner,
  getItemsFromCollection,
  getOwnersFromCollection,
  getVolumenFromCollection,
} from "../utils/collections.js";
import { getAllNftsInfo } from "../utils/nfts.js";
import { uploadToCDN } from "../utils/sanity.js";
import {
  createUserCollectionOptions,
  getUserCollectionsOptions,
  setNotShowRedirect,
} from "../utils/usersCollectionsOptions.js";

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

      const owners = await getOwnersFromCollection(nftsFromCol);
      const volumen = await getVolumenFromCollection(
        collectionInfo.contractAddress
      );

      const formatted = await getAllNftsInfo(nftsFromCol);
      const result = {
        ...collectionInfo._doc,
        nfts: formatted,
        owners: owners,
        volumen: volumen,
      };
      if (collectionInfo) {
        res.status(200).send(result);
      } else {
        res.status(204).send("Collection not found");
      }
    } catch (e) {
      console.log(e);
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

  static async getCollectionUserOptions(req, res) {
    try {
      const { contractAddress, user } = req.query;
      const collectionOptions = await getUserCollectionsOptions(
        contractAddress,
        user
      );

      res.status(200).send(collectionOptions);
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
        explicitContent,
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
        explicitContent,
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
        explicitContent,
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
        instagramURL,
        explicitContent
      );
      res.status(200).send(createdCollection);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async newUserCollectionOptions(req, res) {
    try {
      const { contractAddress, user } = req.body;

      if (user !== "") {
        const collectionOptions = await getUserCollectionsOptions(
          contractAddress,
          user
        );
        if (collectionOptions) {
          res.status(205).send("Already created");
        } else {
          const doc = {
            contractAddress,
            user,
            notShowRedirect: false,
          };
          const createdCollection = await createUserCollectionOptions(doc);
          res.status(200).send(createdCollection);
        }
      } else {
        res.status(205).send("Pass valid user");
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async setShowRedirect(req, res) {
    try {
      const { contractAddress, user } = req.body;
      const createdCollection = await setNotShowRedirect(contractAddress, user);
      res.status(200).send(createdCollection);
    } catch (e) {
      res.status(500).send(e);
    }
  }
}

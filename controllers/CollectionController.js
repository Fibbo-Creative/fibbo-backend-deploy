import {
  getCollectionInfo,
  getCollectionsFromOwner,
} from "../utils/collections.js";
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

  static async getCollections(req, res) {
    try {
      const { owner } = req.query;
      const collections = await getCollectionsFromOwner(owner);
      res.status(200).send(collections);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  //POST

  static async saveCollectionDetails(req, res) {
    try {
      // TO DO
      res.status(204).send("Collection not found");
    } catch (e) {
      res.status(500).send(e);
    }
  }
}

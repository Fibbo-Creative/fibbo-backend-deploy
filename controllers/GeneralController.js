import { filterItemsByTitle, getNftInfoById } from "../utils/nfts.js";
import { checkNFSW } from "../lib/deepai.js";
import { getPayTokenInfo, getPayTokens } from "../utils/payTokens.js";
import { addImgToIpfs, addJsonToIpfs } from "../utils/ipfs.js";
import sanity_client from "../lib/sanity.js";
import {
  deleteNotification,
  getAllNotifications,
} from "../utils/notifications.js";
import nft from "../models/nft.js";
import { uploadToCDN } from "../utils/sanity.js";
import { imgsDir } from "../utils/multer.js";
import { filterCollectionsByName } from "../utils/collections.js";

export default class GeneralController {
  constructor() {}

  static async searchItems(req, res) {
    try {
      const { query } = req.query;

      //Buscaremos primero en los títulos de los items

      const filteredItems = await filterItemsByTitle(query);
      const filteredProfiles = await filterProfilesByUsername(query);
      const filteredCollections = await filterCollectionsByName(query);
      res.send({
        items: filteredItems,
        profiles: filteredProfiles,
        collections: filteredCollections,
      });
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async getAllPayTokens(req, res) {
    try {
      //Buscaremos primero en los títulos de los items

      const payTokens = await getPayTokens();

      res.send(payTokens);
    } catch (e) {
      res.status(500).send(e);
    }
  }
  static async getPayTokenInfo(req, res) {
    try {
      const { address } = req.query;

      //Buscaremos primero en los títulos de los items

      const payTokenInfo = await getPayTokenInfo(address);
      res.send(payTokenInfo);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async getAllNotifications(req, res) {
    try {
      const { address } = req.query;

      //Buscaremos primero en los títulos de los items

      const notifications = await getAllNotifications(address);
      let finalResult = [];
      await Promise.all(
        notifications.map(async (item) => {
          const nft = await getNftInfoById(
            item.tokenId,
            item.collectionAddress
          );
          const profile = await getProfileInfo(address);
          const collection = await getCollectionInfo(item.collectionAddress);

          const result = {
            ...item._doc,
            nftData: nft,
            reciever: profile,
            collection: collection,
          };
          finalResult = [...finalResult, result];
        })
      );
      res.send(finalResult);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async uploadFiletoCDN(req, res) {
    try {
      const file = req.file;
      const { uploadToIpfs, contentType, isExplicit } = req.body;

      const uploadedFileSanity = await uploadToCDN(
        sanity_client,
        contentType,
        file ? file : null,
        imgsDir
      );

      let ipfsImage = "None";
      if (uploadToIpfs === "true") {
        ipfsImage = await addImgToIpfs(file);
      }

      if (
        isExplicit === "false" &&
        contentType !== "VIDEO" &&
        contentType !== "AUDIO"
      ) {
        const { id, output } = await checkNFSW(uploadedFileSanity.url);
        const { detections, nsfw_score } = output;

        if (nsfw_score > 0.4) {
          res.status(207).send("INVALID IMG");
        } else {
          await removeFiles(imgsDir);

          res.send({
            sanity: uploadedFileSanity.url,
            ipfs: ipfsImage.IpfsHash ? ipfsImage.IpfsHash : ipfsImage,
          });
        }
      } else {
        await removeFiles(imgsDir);
        res.send({
          sanity: uploadedFileSanity.url,
          ipfs: ipfsImage.IpfsHash ? ipfsImage.IpfsHash : ipfsImage,
        });
      }
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async uploadJSONMetadata(req, res) {
    try {
      const { name, description, externalLink, image, contentType, audio } =
        req.body;

      let data = {
        name: name,
        description: description,
        external_link: externalLink,
      };

      if (contentType === "VIDEO") {
        data = {
          ...data,
          animation_url: image,
        };
      }

      if (contentType === "AUDIO") {
        data = {
          ...data,
          image: image,
          animation_url: audio,
        };
      }

      if (contentType === "IMG") {
        data = {
          ...data,
          image: image,
        };
      }

      const ipfsCID = await addJsonToIpfs(data);

      res.send(ipfsCID.IpfsHash);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async updateEventsInfo(req, res) {
    try {
      await nft.updateMany(
        { contentType: { $exists: false } },
        { contentType: "IMG" }
      );
      res.send("OK");
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async deleteNotification(req, res) {
    try {
      const { notificationId } = req.body;
      await deleteNotification(notificationId);
      res.status(200).send("OK");
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
}

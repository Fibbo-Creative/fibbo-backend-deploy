import { uploadToCDN } from "../utils/sanity.js";
import { imgsDir, removeFiles } from "../utils/multer.js";
import sanity_client from "../lib/sanity.js";
import { filterProfilesByUsername } from "../utils/profiles.js";
import { filterItemsByTitle } from "../utils/nfts.js";
import { checkNFSW } from "../lib/deepai.js";
import { getPayTokenInfo, getPayTokens } from "../utils/payTokens.js";
import { updateEvents } from "../utils/events.js";

export default class GeneralController {
  constructor() {}

  static async searchItems(req, res) {
    try {
      const { query } = req.query;

      //Buscaremos primero en los títulos de los items

      const filteredItems = await filterItemsByTitle(query);
      const filteredProfiles = await filterProfilesByUsername(query);
      res.send({
        items: filteredItems,
        profiles: filteredProfiles,
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

  static async uploadImg(req, res) {
    try {
      const image = req.file;
      const uploadedImgSanity = await uploadToCDN(
        sanity_client,
        image ? image : null,
        imgsDir
      );

      const { id, output } = await checkNFSW(uploadedImgSanity.url);
      const { detections, nsfw_score } = output;

      if (nsfw_score > 0.4) {
        res.status(207).send("INVALID IMG");
      } else {
        await removeFiles(imgsDir);

        res.send(uploadedImgSanity.url);
      }
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async updateEventsInfo(req, res) {
    try {
      await updateEvents();
      res.send("OK");
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
}

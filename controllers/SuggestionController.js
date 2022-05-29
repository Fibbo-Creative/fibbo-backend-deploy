import { ethers } from "ethers";
import { SUGGESTION_CONTRACT } from "../contracts/index.js";
import Suggestions from "../models/suggestions.js";
import {
  deleteSuggestion,
  getPendingSuggestions,
  getSuggestionInfo,
} from "../utils/suggestions.js";

export default class SuggestionController {
  constructor() {}
  //GET
  static async getPending(req, res) {
    try {
      const pendingSugg = await getPendingSuggestions();

      res.status(200).send(pendingSugg);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  //POST
  static async newSuggestion(req, res) {
    try {
      const { wallet, title, description } = req.body;

      const suggestionDoc = {
        proposer: wallet,
        title: title,
        description: description,
      };

      const createdDoc = await Suggestions.create(suggestionDoc);

      res.status(200).send(createdDoc);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async acceptSuggestion(req, res) {
    try {
      const { title, proposer, value } = req.body;
      const suggInfo = await getSuggestionInfo(title, proposer);

      if (suggInfo) {
        const txCreateSugg = await SUGGESTION_CONTRACT.createSuggestion(
          suggInfo.title,
          suggInfo.description,
          ethers.utils.parseEther(value)
        );

        txCreateSugg.wait(1);
      }

      await deleteSuggestion(title, proposer);

      res.status(200).send("Suggestion accepted");
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async declineSuggestion(req, res) {
    try {
      const { title, proposer } = req.body;
      const suggInfo = await getSuggestionInfo(title, proposer);

      if (suggInfo) {
        await deleteSuggestion(title, proposer);
      }

      res.status(200).send("Suggestion declined");
    } catch (e) {
      res.status(500).send(e);
    }
  }
}

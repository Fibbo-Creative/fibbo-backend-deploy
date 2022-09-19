import { ethers } from "ethers";
import { getCommunityContract } from "../contracts/index.js";
import PendingSuggestions from "../models/pendingSuggestions.js";
import SavedSuggestions from "../models/savedSuggestions.js";
import Suggestions from "../models/suggestions.js";
import {
  deletePendingSuggestion,
  deleteSuggestion,
  getActiveSuggestions,
  getPendingSuggestion,
  getPendingSuggestions,
  getSavedSuggestions,
  getSuggestionInfo,
  voteSuggestion,
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

  static async getActive(req, res) {
    try {
      const pendingSugg = await getActiveSuggestions();

      res.status(200).send(pendingSugg);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async getSaved(req, res) {
    try {
      const pendingSugg = await getSavedSuggestions();

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

      const createdDoc = await PendingSuggestions.create(suggestionDoc);

      res.status(200).send(createdDoc);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async acceptSuggestion(req, res) {
    try {
      const { title, proposer } = req.body;
      const suggInfo = await getPendingSuggestion(title, proposer);
      if (suggInfo) {
        const doc = {
          title: title,
          description: suggInfo.description,
          proposer: proposer,
          votes: 0,
          voters: [],
        };

        await Suggestions.create(doc);
      }

      await deletePendingSuggestion(title, proposer);

      res.status(200).send("Suggestion accepted");
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async saveSuggestion(req, res) {
    try {
      const { title, proposer } = req.body;
      const suggInfo = await getSuggestionInfo(title, proposer);
      if (suggInfo) {
        const doc = {
          title: title,
          description: suggInfo.description,
          votes: suggInfo.votes,
          proposer: proposer,
          voters: suggInfo.voters,
        };

        await SavedSuggestions.create(doc);
      }

      await deleteSuggestion(title, proposer);

      res.status(200).send("Suggestion accepted");
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async declineSuggestion(req, res) {
    try {
      const { title, proposer } = req.body;
      const suggInfo = await getPendingSuggestion(title, proposer);

      if (suggInfo) {
        await deletePendingSuggestion(title, proposer);
      }

      res.status(200).send("Suggestion declined");
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async vote(req, res) {
    try {
      const { title, proposer, voter } = req.body;
      const suggInfo = await getSuggestionInfo(title, proposer);
      if (suggInfo) {
        const voters = suggInfo.voters;
        const votes = suggInfo.votes;
        if (voters.includes(voter)) {
          res.status(205).send("You already voted!");
        } else {
          await voteSuggestion(title, proposer, voter, voters, votes);
        }
      }

      res.status(200).send("voted succesfully");
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
}

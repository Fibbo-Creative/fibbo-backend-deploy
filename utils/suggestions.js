import PendingSuggestions from "../models/pendingSuggestions.js";
import Suggestions from "../models/suggestions.js";

export const createSuggestion = async (doc) => {
  const newSuggestion = await Suggestions.create(doc);
  if (newSuggestion) {
    return newSuggestion._doc;
  }
};

export const getSuggestionInfo = async (title, proposer) => {
  const suggInfo = await Suggestions.findOne({
    title: title,
    proposer: proposer,
  });
  if (suggInfo) return suggInfo;
};

export const getPendingSuggestions = async () => {
  const suggInfo = await PendingSuggestions.find();
  if (suggInfo) return suggInfo;
};

export const getActiveSuggestions = async () => {
  const suggInfo = await Suggestions.find();
  if (suggInfo) return suggInfo;
};

export const getPendingSuggestion = async (title, proposer) => {
  const suggInfo = await PendingSuggestions.findOne({
    title: title,
    proposer: proposer,
  });
  if (suggInfo) return suggInfo;
};

export const deleteSuggestion = async (title, proposer) => {
  const suggInfo = await Suggestions.deleteOne({
    title: title,
    proposer: proposer,
  });
  if (suggInfo) return suggInfo;
};

export const deletePendingSuggestion = async (title, proposer) => {
  const suggInfo = await PendingSuggestions.deleteOne({
    title: title,
    proposer: proposer,
  });
  if (suggInfo) return suggInfo;
};

export const voteSuggestion = async (title, proposer, voter, voters, votes) => {
  const suggInfo = await Suggestions.updateOne(
    {
      title: title,
      proposer: proposer,
    },
    {
      votes: votes + 1,
      voters: [...voters, voter],
    }
  );
  if (suggInfo) return suggInfo;
};

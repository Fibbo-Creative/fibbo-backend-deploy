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
  const suggInfo = await Suggestions.find();
  if (suggInfo) return suggInfo;
};

export const deleteSuggestion = async (title, proposer) => {
  const suggInfo = await Suggestions.deleteOne({
    title: title,
    proposer: proposer,
  });
  if (suggInfo) return suggInfo;
};

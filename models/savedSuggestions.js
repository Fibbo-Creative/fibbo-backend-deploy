import mongoose from "mongoose";

const savedSuggestionsSchema = mongoose.Schema({
  proposer: String,
  title: String,
  description: String,
  votes: Number,
  voters: Array,
});

export default mongoose.model("savedsuggestions", savedSuggestionsSchema);

import mongoose from "mongoose";

const suggestionsSchema = mongoose.Schema({
  proposer: String,
  title: String,
  description: String,
  votes: Number,
  voters: Array,
});

export default mongoose.model("suggestions", suggestionsSchema);

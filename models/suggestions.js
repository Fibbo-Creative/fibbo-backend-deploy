import mongoose from "mongoose";

const suggestionsSchema = mongoose.Schema({
  proposer: String,
  title: String,
  description: String,
});

export default mongoose.model("suggestions", suggestionsSchema);

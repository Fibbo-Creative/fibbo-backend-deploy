import mongoose from "mongoose";

const pendingSuggestionsSchema = mongoose.Schema({
  proposer: String,
  title: String,
  description: String,
});

export default mongoose.model("pendingsuggestions", pendingSuggestionsSchema);

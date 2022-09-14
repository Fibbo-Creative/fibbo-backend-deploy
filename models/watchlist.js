import mongoose from "mongoose";

const watchlistsSchema = mongoose.Schema({
  collectionAddress: String,
  for: String,
});

export default mongoose.model("watchlists", watchlistsSchema);

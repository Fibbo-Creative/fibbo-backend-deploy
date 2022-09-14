import mongoose from "mongoose";

const favoriteItemSchema = mongoose.Schema({
  collectionAddress: String,
  tokenId: Number,
  for: String,
});

export default mongoose.model("favoriteitems", favoriteItemSchema);

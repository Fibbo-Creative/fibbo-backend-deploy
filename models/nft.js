import mongoose from "mongoose";

const nftSchema = mongoose.Schema({
  collectionAddress: String,
  name: String,
  description: String,
  owner: String,
  creator: String,
  itemId: Number,
  image: String,
  royalty: Number,
});

export default mongoose.model("nfts", nftSchema);

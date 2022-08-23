import mongoose from "mongoose";

const nftSchema = mongoose.Schema({
  collectionAddress: String,
  name: String,
  description: String,
  owner: String,
  creator: String,
  tokenId: Number,
  image: String,
  ipfsImage: String,
  ipfsMetadata: String,
  royalty: Number,
  createdAt: Date,
  additionalContent: String,
  hasFreezedMetadata: Boolean,
});

export default mongoose.model("nfts", nftSchema);

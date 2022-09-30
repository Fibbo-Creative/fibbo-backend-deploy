import mongoose from "mongoose";

const nftSchema = mongoose.Schema({
  collectionAddress: String,
  name: String,
  description: String,
  externalLink: String,
  owner: String,
  creator: String,
  tokenId: Number,
  contentType: String,
  audio: String,
  video: String,
  image: String,
  ipfsImage: String,
  ipfsMetadata: String,
  categories: Array,
  royalty: Number,
  createdAt: Date,
  additionalContent: String,
  hasFreezedMetadata: Boolean,
});

export default mongoose.model("nfts", nftSchema);

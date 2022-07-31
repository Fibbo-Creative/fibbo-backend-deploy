import mongoose from "mongoose";

const nftForSaleSchema = mongoose.Schema({
  collectionAddress: String,
  collectionName: String,
  name: String,
  tokenId: Number,
  image: String,
  price: Number,
  owner: String,
  forSaleAt: Date,
  payToken: String,
});

export default mongoose.model("nftsForSale", nftForSaleSchema);

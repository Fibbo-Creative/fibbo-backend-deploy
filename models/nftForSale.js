import mongoose from "mongoose";

const nftForSaleSchema = mongoose.Schema({
  collectionAddress: String,
  name: String,
  itemId: Number,
  tokenId: Number,
  image: String,
  price: Number,
  forSaleAt: Date,
});

export default mongoose.model("nftsForSale", nftForSaleSchema);
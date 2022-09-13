import mongoose from "mongoose";

const auctionSchema = mongoose.Schema({
  collectionAddress: String,
  tokenId: Number,
  owner: String,
  payToken: String,
  reservePrice: Number,
  buyNowPrice: Number,
  startTime: Number,
  endTime: Number,
});

export default mongoose.model("auctions", auctionSchema);

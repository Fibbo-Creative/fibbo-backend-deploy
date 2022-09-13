import mongoose from "mongoose";

const highestBidders = mongoose.Schema({
  tokenId: Number,
  collectionAddress: String,
  bidder: String,
  bid: Number,
  payToken: String,
});

export default mongoose.model("highestbidders", highestBidders);

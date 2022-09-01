import mongoose from "mongoose";

const highestBidders = mongoose.Schema({
  tokenId: Number,
  collectionAddress: String,
  bidder: String,
});

export default mongoose.model("highestbidders", highestBidders);

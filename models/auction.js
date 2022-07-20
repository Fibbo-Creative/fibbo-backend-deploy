import mongoose from "mongoose";

const auctionSchema = mongoose.Schema({
  collectionAddress: String,
  tokenId: Number,
  payToken: String,
  reservePrice: Number,
  startTime: Number,
  endTime: Number,
});

export default mongoose.model("auctions", auctionSchema);

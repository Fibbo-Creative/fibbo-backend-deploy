import mongoose from "mongoose";

const offerSchema = mongoose.Schema({
  creator: String,
  collectionAddress: String,
  tokenId: Number,
  payToken: String,
  price: Number,
  deadline: Number,
  accepted: Boolean,
});

export default mongoose.model("offers", offerSchema);

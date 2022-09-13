import mongoose from "mongoose";

const acceptedOffersSchema = mongoose.Schema({
  creator: String,
  collectionAddress: String,
  tokenId: Number,
  payToken: String,
  price: Number,
});

export default mongoose.model("acceptedoffers", acceptedOffersSchema);

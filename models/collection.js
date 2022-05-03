import mongoose from "mongoose";

const collectionSchema = mongoose.Schema({
  contractAddress: String,
  name: String,
  numberOfItems: Number,
});

export default mongoose.model("collections", collectionSchema);

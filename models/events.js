import mongoose from "mongoose";

const eventSchema = mongoose.Schema({
  eventType: String,
  eventDesc: String,
  tokenId: Number,
  collectionAddress: String,
  from: String,
  to: String,
  timestamp: Date,
  price: Number,
  payToken: String,
});

export default mongoose.model("events", eventSchema);

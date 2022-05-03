import mongoose from "mongoose";

const eventSchema = mongoose.Schema({
  eventType: String,
  tokenId: Number,
  collectionAddress: String,
  from: String,
  to: String,
  timestamp: Date,
  price: Number,
});

export default mongoose.model("events", eventSchema);

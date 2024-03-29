import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
  type: String,
  collectionAddress: String,
  tokenId: Number,
  to: String,
  timestamp: Date,
  params: {},
  visible: Boolean,
});

export default mongoose.model("notifications", notificationSchema);

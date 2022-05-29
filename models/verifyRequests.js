import mongoose from "mongoose";

const verifyRequestShcema = mongoose.Schema({
  proposer: String,
  description: String,
});

export default mongoose.model("verifyRequests", verifyRequestShcema);

import mongoose from "mongoose";

const verifyRequestShcema = mongoose.Schema({
  proposer: String,
  name: String,
  lastName: String,
  description: String,
  email: String,
});

export default mongoose.model("verifyRequests", verifyRequestShcema);

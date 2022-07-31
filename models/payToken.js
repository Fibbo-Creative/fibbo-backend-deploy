import mongoose from "mongoose";

const payTokenSchema = mongoose.Schema({
  contractAddress: String,
  decimals: Number,
  name: String,
  image: String,
  disabled: Boolean,
});

export default mongoose.model("paytokens", payTokenSchema);

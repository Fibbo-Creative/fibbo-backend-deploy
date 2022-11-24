import mongoose from "mongoose";

const adminBalanceSchema = mongoose.Schema({
  name: String,
  balance: Number,
});

export default mongoose.model("adminBalance", adminBalanceSchema);

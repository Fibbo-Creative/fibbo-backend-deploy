import mongoose from "mongoose";

const reportSchema = mongoose.Schema({
  type: String,
  description: String,
  reporter: String,
  reported: Object,
});

export default mongoose.model("reports", reportSchema);

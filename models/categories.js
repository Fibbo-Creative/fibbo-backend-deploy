import mongoose from "mongoose";

const categoriesSchema = mongoose.Schema({
  identifier: String,
  name: Object,
  icon: String,
});

export default mongoose.model("categories", categoriesSchema);

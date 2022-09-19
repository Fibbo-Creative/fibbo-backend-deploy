import mongoose from "mongoose";

const adminusersSchema = mongoose.Schema({
  email: String,
  password: String,
  token: String,
});

export default mongoose.model("adminusers", adminusersSchema);

import mongoose from "mongoose";

const profileSchema = mongoose.Schema({
  wallet: String,
  username: String,
  profileImg: String,
  profileBanner: String,
  followers: Array,
  following: Array,
  ftmSended: Boolean,
  verified: Boolean,
  importedWFTM: Boolean,
});

export default mongoose.model("profiles", profileSchema);

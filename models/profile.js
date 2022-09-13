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
  notShowRedirect: Boolean,
  email: String,
  bio: String,
});

export default mongoose.model("profiles", profileSchema);

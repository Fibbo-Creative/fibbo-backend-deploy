import mongoose from "mongoose";

const collectionSchema = mongoose.Schema({
  contractAddress: String,
  creator: String,
  name: String,
  description: String,
  logoImage: String,
  featuredImage: String,
  bannerImage: String,
  customURL: String,
  websiteURL: String,
  discordURL: String,
  twitterURL: String,
  instagramURL: String,
  telegramURL: String,
  numberOfItems: Number,
});

export default mongoose.model("collections", collectionSchema);

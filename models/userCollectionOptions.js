import mongoose from "mongoose";

const userCollection = mongoose.Schema({
  contractAddress: String,
  user: String,
  notShowRedirect: Boolean,
});

export default mongoose.model("usersCollectionsOptions", userCollection);

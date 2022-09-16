import express from "express";
import ProfileController from "../controllers/ProfileController.js";
import upload from "../lib/multer.js";

const ProfileRouter = express.Router();

ProfileRouter.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

//GET
ProfileRouter.get("/profile", ProfileController.getProfileData);
ProfileRouter.get("/all", ProfileController.getAllProfiles);
ProfileRouter.get("/verified", ProfileController.getVerifiedArtists);
ProfileRouter.get("/history", ProfileController.getWalletHistory);
ProfileRouter.get("/offers", ProfileController.getWalletOffers);
ProfileRouter.get("/favorites", ProfileController.getFavorites);

ProfileRouter.get("/bids", ProfileController.getWalletBids);

//POST
ProfileRouter.post("/newProfile", ProfileController.newProfile);
ProfileRouter.post(
  "/setProfileImg",
  upload.single("image"),
  ProfileController.uploadProfileImg
);
ProfileRouter.post(
  "/setBanner",
  upload.single("image"),
  ProfileController.uploadBannerImg
);
ProfileRouter.post("/setUsername", ProfileController.updateUsername);
ProfileRouter.post("/setImportWFTM", ProfileController.updateImportWFTM);
ProfileRouter.post("/setNotShowRedirect", ProfileController.updateShowRedirect);
ProfileRouter.post("/update", ProfileController.updateProfile);
ProfileRouter.post("/updateEmail", ProfileController.updateEmail);

export default ProfileRouter;

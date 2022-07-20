import express from "express";
import ProfileController from "../controllers/ProfileController.js";
import upload from "../lib/multer.js";

const ProfileRouter = express.Router();

ProfileRouter.use((req, res, next) => {
  next();
});

//GET
ProfileRouter.get("/profile", ProfileController.getProfileData);
ProfileRouter.get("/all", ProfileController.getAllProfiles);
ProfileRouter.get("/verified", ProfileController.getVerifiedArtists);
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

export default ProfileRouter;
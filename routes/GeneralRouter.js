import express from "express";
import GeneralController from "../controllers/GeneralController.js";
import upload from "../lib/multer.js";
const GeneralRouter = express.Router();

GeneralRouter.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

//GET
GeneralRouter.get("/search", GeneralController.searchItems);

GeneralRouter.get("/payTokens", GeneralController.getAllPayTokens);
GeneralRouter.get("/payToken", GeneralController.getPayTokenInfo);

GeneralRouter.get("/notifications", GeneralController.getAllNotifications);

//POST
GeneralRouter.post(
  "/uploadImg",
  upload.single("file"),
  GeneralController.uploadtoCDN
);

GeneralRouter.post("/uploadJson", GeneralController.uploadJSONMetadata);
GeneralRouter.post("/updateEvents", GeneralController.updateEventsInfo);

GeneralRouter.post("/deleteNotification", GeneralController.deleteNotification);

export default GeneralRouter;

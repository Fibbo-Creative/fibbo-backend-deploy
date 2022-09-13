import express from "express";
import VerifyController from "../controllers/VerifyController.js";
const VerifyRouter = express.Router();

VerifyRouter.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

//GET
VerifyRouter.get("/allRequests", VerifyController.getRequests);
//POST
VerifyRouter.post("/sendRequest", VerifyController.newVerifyRequest);
VerifyRouter.post("/verifyArtist", VerifyController.verifyNewArtist);
VerifyRouter.post("/declineArtist", VerifyController.declineRequest);

export default VerifyRouter;

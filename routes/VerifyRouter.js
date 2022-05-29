import express from "express";
import GeneralController from "../controllers/GeneralController.js";
import VerifyController from "../controllers/VerifyController.js";
import upload from "../lib/multer.js";
const VerifyRouter = express.Router();

VerifyRouter.use((req, res, next) => {
  next();
});

//GET
VerifyRouter.get("/allRequests", VerifyController.getRequests);
//POST
VerifyRouter.post("/sendRequest", VerifyController.newVerifyRequest);

export default VerifyRouter;

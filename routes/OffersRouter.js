import express from "express";
import OffersController from "../controllers/OffersController.js";
const OffersRouter = express.Router();

OffersRouter.use((req, res, next) => {
  next();
});

//GET
OffersRouter.get("/get", OffersController.getOffers);

//POST
OffersRouter.post("/accept", OffersController.offerAccepted);

export default OffersRouter;

import express from "express";
import CollectionController from "../controllers/CollectionController.js";

const CollectionRouter = express.Router();

CollectionRouter.use((req, res, next) => {
  next();
});

//GET
CollectionRouter.get("/collectionData", CollectionController.getCollectionData);
//POST

export default CollectionRouter;

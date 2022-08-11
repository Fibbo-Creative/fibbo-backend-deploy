import express from "express";
import CollectionController from "../controllers/CollectionController.js";

const CollectionRouter = express.Router();

CollectionRouter.use((req, res, next) => {
  next();
});

//GET
CollectionRouter.get("/collectionData", CollectionController.getCollectionData);
CollectionRouter.get("/available", CollectionController.getCollections);
CollectionRouter.get("/myCollection", CollectionController.getCollections);

//POST
CollectionRouter.post("/new", CollectionController.saveCollectionDetails);

export default CollectionRouter;

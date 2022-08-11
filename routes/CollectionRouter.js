import express from "express";
import CollectionController from "../controllers/CollectionController.js";

const CollectionRouter = express.Router();

CollectionRouter.use((req, res, next) => {
  next();
});

//GET
CollectionRouter.get("/collectionData", CollectionController.getCollectionData);
CollectionRouter.get(
  "/collectionDetail",
  CollectionController.getCollectionDetails
);

CollectionRouter.get("/available", CollectionController.getCollections);
CollectionRouter.get(
  "/myCollections",
  CollectionController.getCollectionsFromOwner
);

//POST
CollectionRouter.post("/new", CollectionController.saveCollectionDetails);

export default CollectionRouter;

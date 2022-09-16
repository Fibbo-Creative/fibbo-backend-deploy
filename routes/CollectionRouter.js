import express from "express";
import CollectionController from "../controllers/CollectionController.js";

const CollectionRouter = express.Router();

CollectionRouter.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

//GET
CollectionRouter.get("/collectionData", CollectionController.getCollectionData);
CollectionRouter.get(
  "/collectionDetail",
  CollectionController.getCollectionDetails
);
CollectionRouter.get("/getAddress", CollectionController.getCollectionAddress);

CollectionRouter.get("/items", CollectionController.getCollectionItems);
CollectionRouter.get("/available", CollectionController.getCollections);
CollectionRouter.get("/all", CollectionController.getAllCollections);
CollectionRouter.get("/watchlist", CollectionController.getWatchlist);

CollectionRouter.get(
  "/myCollections",
  CollectionController.getCollectionsFromOwner
);

CollectionRouter.get("/checkName", CollectionController.checkName);
CollectionRouter.get("/checkURL", CollectionController.checkUrl);

CollectionRouter.get(
  "/collectionUserOptions",
  CollectionController.getCollectionUserOptions
);

//POST
CollectionRouter.post("/new", CollectionController.saveCollectionDetails);
CollectionRouter.post("/edit", CollectionController.editCollection);
CollectionRouter.post(
  "/newOptions",
  CollectionController.newUserCollectionOptions
);
CollectionRouter.post("/setShowRedirect", CollectionController.setShowRedirect);
CollectionRouter.post("/addToWatchlist", CollectionController.addToWatchList);
CollectionRouter.post(
  "/removeFromWatchlist",
  CollectionController.removeFromWatchlist
);

export default CollectionRouter;

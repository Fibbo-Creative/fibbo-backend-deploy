import express from "express";
import NftController from "../controllers/NftsController.js";

const NftRouter = express.Router();

NftRouter.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

//GET
NftRouter.get("/allNfts", NftController.getAllNfts);
NftRouter.get("/nftsForSale", NftController.getNftsForSale);
NftRouter.get("/nftInfo", NftController.getNftInfoById);
NftRouter.get("/nftsByAddress", NftController.getNftsByAddress);
NftRouter.get("/nftsByCreator", NftController.getNftsByCreator);
NftRouter.get("/itemHistory", NftController.getItemHistory);

NftRouter.get("/allTransfers", NftController.getAllTransfers);

//POST
NftRouter.post("/newItem", NftController.newItem);
NftRouter.post("/editItem", NftController.updateNft);
NftRouter.post("/registerRoyalties", NftController.updateNft);

export default NftRouter;

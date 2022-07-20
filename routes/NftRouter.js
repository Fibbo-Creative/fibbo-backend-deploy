import express from "express";
import NftController from "../controllers/NftsController.js";

const NftRouter = express.Router();

NftRouter.use((req, res, next) => {
  next();
});

//GET
NftRouter.get("/allNfts", NftController.getAllNfts);
NftRouter.get("/nftsForSale", NftController.getNftsForSale);
NftRouter.get("/nftInfo", NftController.getNftInfoById);
NftRouter.get("/nftsByAddress", NftController.getNftsByAddress);
NftRouter.get("/itemHistory", NftController.getItemHistory);
NftRouter.get("/allTransfers", NftController.getAllTransfers);

//POST
NftRouter.post("/newItem", NftController.newItem);

export default NftRouter;
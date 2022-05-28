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

//POST
NftRouter.post("/newItem", NftController.newItem);
NftRouter.post("/putForSale", NftController.putForSale);
NftRouter.post("/nftBought", NftController.nftBought);
NftRouter.post("/changePrice", NftController.changePrice);
NftRouter.post("/unlistItem", NftController.unlistItem);

export default NftRouter;

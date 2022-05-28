import express from "express";
import GeneralController from "../controllers/GeneralController.js";
import upload from "../lib/multer.js";
const GeneralRouter = express.Router();

GeneralRouter.use((req, res, next) => {
  next();
});

//GET
GeneralRouter.get("/search", GeneralController.searchItems);
//POST
GeneralRouter.post(
  "/uploadImg",
  upload.single("image"),
  GeneralController.uploadImg
);

export default GeneralRouter;

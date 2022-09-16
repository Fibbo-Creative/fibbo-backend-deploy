import express from "express";
import AdminController from "../controllers/AdminController.js";
const AdminRouter = express.Router();

AdminRouter.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

//GET
AdminRouter.get("/lastBalance", AdminController.getLastBalance);

AdminRouter.get("/lastGasStation", AdminController.getLastGasStation);

export default AdminRouter;

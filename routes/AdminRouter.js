import express from "express";
import AdminController from "../controllers/AdminController.js";
const AdminRouter = express.Router();

AdminRouter.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

//GET
AdminRouter.get("/lastBalance", AdminController.getLastBalance);
AdminRouter.get("/login", AdminController.login);
AdminRouter.get("/loginToken", AdminController.loginToken);
AdminRouter.get("/lastGasStation", AdminController.getLastGasStation);

AdminRouter.get("/reports", AdminController.getAllReports);

//POST
AdminRouter.post("/newCategory", AdminController.newCategory);
AdminRouter.post("/deposit", AdminController.deposit);
AdminRouter.post("/newReport", AdminController.addNewReport);
AdminRouter.post("/deleteReport", AdminController.deleteReport);

export default AdminRouter;

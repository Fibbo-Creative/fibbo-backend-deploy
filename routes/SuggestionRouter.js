import express from "express";
import GeneralController from "../controllers/GeneralController.js";
import SuggestionController from "../controllers/SuggestionController.js";

const SuggestionRouter = express.Router();

SuggestionRouter.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

//GET
SuggestionRouter.get("/pendingSuggestions", SuggestionController.getPending);
SuggestionRouter.get("/activeSuggestions", SuggestionController.getActive);
//POST
SuggestionRouter.post("/new", SuggestionController.newSuggestion);
SuggestionRouter.post("/accept", SuggestionController.acceptSuggestion);
SuggestionRouter.post("/decline", SuggestionController.declineSuggestion);
SuggestionRouter.post("/vote", SuggestionController.vote);

export default SuggestionRouter;

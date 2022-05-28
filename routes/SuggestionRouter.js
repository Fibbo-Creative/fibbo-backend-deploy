import express from "express";
import GeneralController from "../controllers/GeneralController.js";
import SuggestionController from "../controllers/SuggestionController.js";

const SuggestionRouter = express.Router();

SuggestionRouter.use((req, res, next) => {
  next();
});

//GET
SuggestionRouter.get("/pendingSuggestions", SuggestionController.getPending);
//POST
SuggestionRouter.post("/new", SuggestionController.newSuggestion);
SuggestionRouter.post("/accept", SuggestionController.acceptSuggestion);
SuggestionRouter.post("/decline", SuggestionController.declineSuggestion);

export default SuggestionRouter;

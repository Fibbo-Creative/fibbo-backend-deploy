//NPM DEPENDENCIES
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import NftRouter from "./routes/NftRouter.js";
import GeneralRouter from "./routes/GeneralRouter.js";
import ProfileRouter from "./routes/ProfileRouter.js";
import SuggestionRouter from "./routes/SuggestionRouter.js";
import CollectionRouter from "./routes/CollectionRouter.js";
import VerifyRouter from "./routes/VerifyRouter.js";
import { listenToEvents } from "./contracts/index.js";
import OffersRouter from "./routes/OffersRouter.js";
import initScheduledJobs from "./contracts/shedulers/sheduler.js";
import AdminRouter from "./routes/AdminRouter.js";

dotenv.config();

const PORT = process.env.PORT || 9000;

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.status(200).send("Welcome to the Fibbo API!");
});

app.use("/api", GeneralRouter);
app.use("/collections", CollectionRouter);
app.use("/nfts", NftRouter);
app.use("/offers", OffersRouter);
app.use("/users", ProfileRouter);
app.use("/suggestions", SuggestionRouter);
app.use("/verify", VerifyRouter);
app.use("/admin", AdminRouter);

initScheduledJobs();

app.listen(PORT, () => {
  console.log("Server listening!");
  listenToEvents();
});

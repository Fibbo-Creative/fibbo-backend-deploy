//NPM DEPENDENCIES
import dotenv from "dotenv";
import express from "express";

import path from "path";
import cors from "cors";
import { dirname } from "path";
import { fileURLToPath } from "url";

import sanity_client from "./lib/sanity.js";
import upload from "./lib/multer.js";
import nftRoutes from "./routes/nftRoutes.js";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));
const imgsDir = path.join(__dirname, "images");

dotenv.config();

const PORT = process.env.PORT || 9000;
// OWN PROJECT DEPENDECNIES

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://fibbo-market.web.app",
  })
);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.status(200).send("Welcome to the Fibbo API!");
});

nftRoutes(app, upload, imgsDir, sanity_client);

app.listen(PORT, () => {
  console.log("Server listening!");
});

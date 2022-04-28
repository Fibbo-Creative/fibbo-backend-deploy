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

const __dirname = dirname(fileURLToPath(import.meta.url));
const imgsDir = path.join(__dirname, "images");

dotenv.config();

// OWN PROJECT DEPENDECNIES

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("Welcome to the Fibbo API!");
});
nftRoutes(app, upload, imgsDir, sanity_client);

app.listen(9000, () => {
  console.log("Listening at 9000");
});

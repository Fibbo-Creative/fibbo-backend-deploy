import pinataSDK from "@pinata/sdk";
import fs from "fs";
import path from "path";
import { imgsDir } from "./multer.js";
import dotenv from "dotenv";

dotenv.config();
const pinata = pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET);

export const addImgToIpfs = async (file) => {
  const readableStreamForFile = fs.createReadStream(
    path.join(imgsDir, file.originalname),
    {
      filename: file.originalname,
    }
  );
  const imgAddedToIPFS = await pinata.pinFileToIPFS(readableStreamForFile);

  return imgAddedToIPFS;
};

export const addJsonToIpfs = async (data) => {
  const ipfsCID = await pinata.pinJSONToIPFS(data);
  return ipfsCID;
};

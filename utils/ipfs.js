import pinataSDK from "@pinata/sdk";
import fs from "fs";
import path from "path";
import { imgsDir } from "./multer.js";

const pinata = pinataSDK(
  "044b7966cdea15c1866f",
  "290895794521d3c0026f0c31c59b5df2d6477a148f90b0b3c308b174dc89e535"
);

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

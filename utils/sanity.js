import fs from "fs";
import path from "path";

export const uploadToCDN = async (sanity_client, image, imgsDir) => {
  const readableImgString = fs.createReadStream(
    path.join(imgsDir, image.originalname),
    {
      filename: image.originalname,
    }
  );
  const imgAssetSanity = await sanity_client.assets.upload(
    "image",
    readableImgString
  );

  return imgAssetSanity;
};

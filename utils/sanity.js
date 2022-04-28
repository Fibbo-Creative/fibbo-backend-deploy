import fs from "fs";
import path from "path";

export const uploadToCDN = async (sanity_client, image, imgsDir) => {
  const imgAssetSanity = await sanity_client.assets.upload(
    "image",
    fs.createReadStream(path.join(imgsDir, image.originalname), {
      filename: image.originalname,
    })
  );

  return imgAssetSanity;
};

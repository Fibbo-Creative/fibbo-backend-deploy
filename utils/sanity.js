import fs from "fs";
import path from "path";

async function stream2buffer(stream) {
  return (
    new Promise() <
    Buffer >
    ((resolve, reject) => {
      const _buf = [];
      if (stream !== null) {
        stream.on("data", (chunk) => _buf.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(_buf)));
        stream.on("error", (err) => reject(`error converting stream - ${err}`));
      }
    })
  );
}

export const uploadToCDN = async (sanity_client, image, imgsDir) => {
  const imageBuffer = await stream2buffer(
    image
      ? fs.createReadStream(path.join(imgsDir, image ? image.originalname : ""))
      : null
  );

  const imgAssetSanity = await sanity_client.assets.upload(
    "image",
    imageBuffer
  );

  return imgAssetSanity;
};

import deepai from "deepai";
import dotenv from "dotenv";

dotenv.config();

deepai.setApiKey(process.env.DEEP_AI_API_KEY);

export const checkNFSW = async (imgUrl) => {
  var resp = await deepai.callStandardApi("nsfw-detector", {
    image: imgUrl,
  });
  return resp;
};

import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const imgsDir = path.join(__dirname, "images");

export const removeFiles = async (directory) => {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      if (
        file.includes(".png") ||
        file.includes(".jpg") ||
        file.includes(".gif") ||
        file.includes(".PNG") ||
        file.includes(".svg") ||
        file.includes(".jpeg") ||
        file.includes(".mp4") ||
        file.includes(".webp") ||
        file.includes(".mp3") ||
        file.includes(".mpeg")
      )
        fs.unlinkSync(path.join(directory, file));
    }
  });
};

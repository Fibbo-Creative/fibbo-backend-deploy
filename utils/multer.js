import fs from "fs";
import path from "path";
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
        file.includes(".mp4")
      )
        fs.unlinkSync(path.join(directory, file));
    }
  });
};

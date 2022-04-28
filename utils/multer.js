import fs from "fs";
import path from "path";
export const removeFiles = async (directory) => {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      console.log(file);
      fs.unlinkSync(path.join(directory, file));
    }
  });
};

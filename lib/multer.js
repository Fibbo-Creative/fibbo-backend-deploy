import multer from "multer";

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "utils/images");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

var upload = multer({
  storage: Storage,
});

export default upload;

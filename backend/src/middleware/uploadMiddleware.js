const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const { AppError } = require("../utils/AppError");

const FILE_FILTER = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new AppError("Only image uploads are supported.", 400));
  }
  return cb(null, true);
};

const LIMITS = { fileSize: 8 * 1024 * 1024 }; // 8 MB

function makeUpload(folder) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `sheesh/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "avif"],
      transformation: [{ quality: "auto", fetch_format: "auto", width: 1400, crop: "limit" }],
    },
  });
  return multer({ storage, limits: LIMITS, fileFilter: FILE_FILTER });
}

module.exports = {
  upload:       makeUpload("gallery"),
  menuUpload:   makeUpload("menu"),
  eventUpload:  makeUpload("events"),
};

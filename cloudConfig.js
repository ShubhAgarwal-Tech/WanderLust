const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const hasCloudinaryConfig =
  Boolean(process.env.CLOUD_NAME) &&
  Boolean(process.env.CLOUD_API_KEY) &&
  Boolean(process.env.CLOUD_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = hasCloudinaryConfig
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "wanderlust_DEV",
        allowedFormats: ["png", "jpg", "jpeg", "webp"],
      },
    })
  : multer.memoryStorage();

module.exports = {
  cloudinary,
  hasCloudinaryConfig,
  storage,
};

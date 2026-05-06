import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Env } from "./env.config";
import multer from "multer";
import { BadRequestException } from "../utils/app-error";

cloudinary.config({
  cloud_name: Env.CLOUDINARY_CLOUD_NAME,
  api_key: Env.CLOUDINARY_API_KEY,
  api_secret: Env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "images",
    format: file.mimetype.split("/")[1],
    resource_type: "image",
    quality: "auto:good",
  }),
});

const imageFileFilter: multer.Options["fileFilter"] = (_, file, cb) => {
  const isValid = /^image\/(jpe?g|png)$/.test(file.mimetype);

  if (!isValid) {
    return cb(new BadRequestException("Only JPG and PNG images are allowed"));
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: imageFileFilter,
});

export const receiptUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: imageFileFilter,
});

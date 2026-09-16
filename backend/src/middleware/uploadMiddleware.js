import multer from "multer";
import { errorResponse } from "../utils/apiResponse.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG, WEBP, and GIF images are allowed.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

export const singleImageUpload = (fieldName = "file") => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return errorResponse(res, 400, "File size exceeds the 5MB limit.", "FILE_TOO_LARGE");
      }
      return errorResponse(res, 400, err.message, "UPLOAD_ERROR");
    } else if (err) {
      return errorResponse(res, 400, err.message, "INVALID_FILE_TYPE");
    }
    next();
  });
};

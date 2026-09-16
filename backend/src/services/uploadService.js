import { uploadToCloudinary } from "../config/cloudinary.js";
import { logger } from "../utils/logger.js";

export const uploadMediaFile = async (file, folder = "ignite-enginow") => {
  if (!file || !file.buffer) {
    throw new Error("No file buffer provided for upload.");
  }
  const result = await uploadToCloudinary(file.buffer, folder);
  logger.info(`File uploaded successfully: ${result.secure_url}`);
  return result.secure_url;
};

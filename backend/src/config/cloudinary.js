import { v2 as cloudinary } from "cloudinary";
import { logger } from "../utils/logger.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY || "mock_key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "mock_secret",
  secure: true,
});

export const uploadToCloudinary = async (fileBuffer, folder = "ignite-enginow") => {
  // If credentials are mock/missing in local dev, provide safe mock URL
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME === "demo" ||
    process.env.CLOUDINARY_CLOUD_NAME === "ignite_demo"
  ) {
    logger.info("Cloudinary mock upload: returning generated mock image URL");
    return {
      secure_url: `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80`,
      public_id: `mock_upload_${Date.now()}`,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          logger.error("Cloudinary upload failed:", error);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;

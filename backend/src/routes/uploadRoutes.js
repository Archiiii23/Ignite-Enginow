import { Router } from "express";
import { singleImageUpload } from "../middleware/uploadMiddleware.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { uploadMediaFile } from "../services/uploadService.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  singleImageUpload("file"),
  asyncHandler(async (req, res) => {
    const file = req.file;
    const folder = req.body.folder || "ignite-enginow";
    const url = await uploadMediaFile(file, folder);
    return successResponse(res, 200, "Image uploaded successfully", { url });
  })
);

export default router;

import { Router } from "express";
import { createReport } from "../controllers/reportController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/", requireAuth, asyncHandler(createReport));

export default router;

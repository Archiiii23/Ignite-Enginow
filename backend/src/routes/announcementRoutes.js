import { Router } from "express";
import { getAnnouncements } from "../controllers/announcementController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getAnnouncements));

export default router;

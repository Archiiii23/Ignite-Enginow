import { Router } from "express";
import { getBanners } from "../controllers/bannerController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getBanners));

export default router;

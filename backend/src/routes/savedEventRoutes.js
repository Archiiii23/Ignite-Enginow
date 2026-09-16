import { Router } from "express";
import {
  getSavedEvents,
  saveEvent,
  unsaveEvent,
} from "../controllers/savedEventController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(getSavedEvents));
router.post("/:id", asyncHandler(saveEvent));
router.delete("/:id", asyncHandler(unsaveEvent));

export default router;

import { Router } from "express";
import {
  getMyRegistrations,
  cancelRegistration,
} from "../controllers/registrationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get("/me", asyncHandler(getMyRegistrations));
router.delete("/:id", asyncHandler(cancelRegistration));

export default router;

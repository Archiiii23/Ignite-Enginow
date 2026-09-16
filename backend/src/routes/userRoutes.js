import { Router } from "express";
import { getCurrentUser, updateCurrentUser } from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { updateProfileValidator } from "../validators/authValidators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get("/me", asyncHandler(getCurrentUser));
router.patch("/me", validate(updateProfileValidator), asyncHandler(updateCurrentUser));

export default router;

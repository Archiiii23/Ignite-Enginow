import { Router } from "express";
import ContactMessage from "../models/ContactMessage.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const router = Router();

// POST /api/contact
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, topic, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, and message are required.",
      });
    }

    const contactMsg = await ContactMessage.create({
      firstName,
      lastName,
      email,
      topic: topic || "Partnership",
      message,
    });

    return ApiResponse.created(res, contactMsg, "Thank you for reaching out! We will reply shortly.");
  })
);

// GET /api/contact (for admins)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return ApiResponse.success(res, messages, "Contact messages fetched successfully");
  })
);

export default router;

import { successResponse, errorResponse } from "../utils/apiResponse.js";
import Banner from "../models/Banner.js";
import AuditLog from "../models/AuditLog.js";

/**
 * Public active banners (/api/banners)
 */
export const getBanners = async (req, res) => {
  const banners = await Banner.find({ active: true }).sort({ displayOrder: 1, createdAt: -1 });
  return successResponse(res, 200, "Banners retrieved", banners);
};

/**
 * Create banner (Admin) (/api/admin/banners)
 */
export const createBanner = async (req, res) => {
  const banner = await Banner.create({
    ...req.body,
    createdBy: req.user._id,
  });

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "BANNER_CREATE",
    entityType: "Banner",
    entityId: banner._id,
    metadata: { title: banner.title },
  });

  return successResponse(res, 201, "Banner created successfully", banner);
};

/**
 * Update banner (Admin) (/api/admin/banners/:id)
 */
export const updateBanner = async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!banner) {
    return errorResponse(res, 404, "Banner not found", "NOT_FOUND");
  }

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "BANNER_UPDATE",
    entityType: "Banner",
    entityId: banner._id,
    metadata: req.body,
  });

  return successResponse(res, 200, "Banner updated successfully", banner);
};

/**
 * Delete banner (Admin) (/api/admin/banners/:id)
 */
export const deleteBanner = async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) {
    return errorResponse(res, 404, "Banner not found", "NOT_FOUND");
  }

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "BANNER_DELETE",
    entityType: "Banner",
    entityId: banner._id,
    metadata: { title: banner.title },
  });

  return successResponse(res, 200, "Banner deleted successfully");
};

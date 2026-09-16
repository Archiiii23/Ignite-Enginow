import { successResponse, errorResponse } from "../utils/apiResponse.js";
import Report from "../models/Report.js";
import AuditLog from "../models/AuditLog.js";

/**
 * Submit report (/api/reports) per Section 42
 */
export const createReport = async (req, res) => {
  const { entityType, entityId, reason, description } = req.body;
  const report = await Report.create({
    reportedBy: req.user._id,
    entityType,
    entityId,
    reason,
    description,
    status: "PENDING",
  });
  return successResponse(res, 201, "Report submitted successfully", report);
};

/**
 * Get all reports (Admin) (/api/admin/reports)
 */
export const getAdminReports = async (req, res) => {
  const reports = await Report.find()
    .populate("reportedBy", "name email")
    .sort({ createdAt: -1 });
  return successResponse(res, 200, "Reports retrieved", reports);
};

/**
 * Resolve or dismiss report (Admin) (/api/admin/reports/:id)
 */
export const updateAdminReport = async (req, res) => {
  const { status, resolution } = req.body;
  const report = await Report.findById(req.params.id);
  if (!report) {
    return errorResponse(res, 404, "Report not found", "NOT_FOUND");
  }

  report.status = status || report.status;
  report.resolution = resolution || report.resolution;
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();
  await report.save();

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "REPORT_RESOLUTION",
    entityType: "Report",
    entityId: report._id,
    metadata: { status, resolution },
  });

  return successResponse(res, 200, "Report updated successfully", report);
};

import { successResponse, errorResponse } from "../utils/apiResponse.js";
import Category from "../models/Category.js";
import AuditLog from "../models/AuditLog.js";

/**
 * Public categories list (/api/categories)
 */
export const getCategories = async (req, res) => {
  const categories = await Category.find({ active: true }).sort({ displayOrder: 1, name: 1 });
  return successResponse(res, 200, "Categories retrieved", categories);
};

/**
 * Admin create category (/api/admin/categories)
 */
export const createCategory = async (req, res) => {
  const { name, description, active, displayOrder } = req.body;
  const category = await Category.create({ name, description, active, displayOrder });

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "CATEGORY_CREATE",
    entityType: "Category",
    entityId: category._id,
    metadata: { name },
  });

  return successResponse(res, 201, "Category created successfully", category);
};

/**
 * Admin update category (/api/admin/categories/:id)
 */
export const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!category) {
    return errorResponse(res, 404, "Category not found", "NOT_FOUND");
  }

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "CATEGORY_UPDATE",
    entityType: "Category",
    entityId: category._id,
    metadata: req.body,
  });

  return successResponse(res, 200, "Category updated successfully", category);
};

/**
 * Admin delete category (/api/admin/categories/:id)
 */
export const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return errorResponse(res, 404, "Category not found", "NOT_FOUND");
  }

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "CATEGORY_DELETE",
    entityType: "Category",
    entityId: category._id,
    metadata: { name: category.name },
  });

  return successResponse(res, 200, "Category deleted successfully");
};

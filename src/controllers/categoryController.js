import * as categoryModel from "../models/categoryModel.js";
import logger from "../utils/logger.js";

// Get all categories excluding soft deleted ones
async function getAllCategories(req, res) {
  try {
    const categories = await categoryModel.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    logger.error(
      "CategoryController.getAllCategories: error retrieving all categories",
      { error },
    );
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getCategory(req, res) {
  try {
    const category = await categoryModel.findById(req.body.id);
    res.json(category);
  } catch (error) {
    logger.error("CategoryController.getCategory: error retrieving category");
    res.status(500).json({ message: error.message });
  }
}

async function createCategory(req, res) {
  try {
    const { categoryname } = req.body;

    // Checking required fields
    if (!categoryname) {
      logger.warn("CategoryController.createCategory: missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Insert category in DB
    const result = await categoryModel.createCategory({
      categoryname,
    });

    res.status(201).json({
      message: "Category created",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      logger.error(
        "CategoryController.createCategory: duplicated category name",
      );
      return res.status(409).json({
        message: "Duplicated category name",
      });
    }

    logger.error("CategoryController.createCategory: error creating category");
    res.status(500).json({ message: error.message });
  }
}

async function updateCategory(req, res) {
  try {
    const { id, categoryname } = req.body;

    if (!id || !categoryname) {
      logger.warn("CategoryController.updateCategory: missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    const fields = [];
    const values = [];

    fields.push("categoryname = ?");
    values.push(categoryname);

    // ID required at the end for WHERE clausule
    values.push(id);

    const result = await categoryModel.updateCategory(fields, values);

    if (result.affectedRows === 0) {
      logger.warn("CategoryController.updateCategory: category not found");
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category updated",
    });
  } catch (error) {
    logger.error("CategoryController.updateCategory: error updating category");
    res.status(500).json({ message: error.message });
  }
}

async function deleteCategory(req, res) {
  try {
    const categoryId = Number(req.params.category_id);
    const userRole = req.user.role;

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      logger.warn("CategoryController.deleteCategory: invalid category id");
      return res.status(400).json({ message: "Invalid category id" });
    }

    // Only admin can delete
    if (userRole !== "admin") {
      logger.warn(
        "CategoryController.deleteCategory: insufficient permissions",
      );
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const result = await categoryModel.deleteCategory(categoryId);

    if (result.affectedRows === 0) {
      logger.warn("CategoryController.deleteCategory: category not found");
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category deleted",
    });
  } catch (error) {
    logger.error("CategoryController.deleteCategory: error deleting category");
    res.status(500).json({ message: error.message });
  }
}

export {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};

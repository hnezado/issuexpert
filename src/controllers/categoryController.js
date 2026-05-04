import * as categoryModel from "../models/categoryModel.js";
import { hashPassword } from "../utils/password.js";

async function getAllCategories(req, res) {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getCategory(req, res) {
  try {
    const category = await categoryModel.findById(req.body.id);
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createCategory(req, res) {
  try {
    const { categoryname, email, password, role_id } = req.body;

    // Checking required fields
    if (!categoryname || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Hashing password
    const hashedPassword = await hashPassword(password);

    // Create category
    const result = await categoryModel.createCategory({
      categoryname,
      email,
      hashedPassword,
      role_id: role_id || 3,
    });

    res.status(201).json({
      message: "Category created",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Categoryname or email is already registered",
      });
    }

    res.status(500).json({ message: error.message });
  }
}

async function updateCategory(req, res) {
  try {
    const { id, categoryname, email, password, role_id } = req.body;

    if (!id || !categoryname || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const fields = [];
    const values = [];

    fields.push("categoryname = ?");
    values.push(categoryname);

    fields.push("email = ?");
    values.push(email);

    if (role_id !== undefined) {
      fields.push("role_id = ?");
      values.push(role_id);
    }

    if (password) {
      const hashedPassword = await hashPassword(password);
      fields.push("password = ?");
      values.push(hashedPassword);
    }

    // ID required at the end for WHERE clausule
    values.push(id);

    const result = await categoryModel.updateCategory(fields, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category updated",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Categoryname or email is already registered",
      });
    }

    res.status(500).json({ message: error.message });
  }
}

async function deleteCategory() {}

export {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};

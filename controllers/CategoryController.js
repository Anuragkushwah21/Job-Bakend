const Category = require("../models/category");
const jobModel = require("../models/job.model");
class CategoryController {
  static CategoryInsert = async (req, res) => {
    try {
      const { role, _id: postedBy } = req.UserData;

      // Check if the user is authorized
      if (role !== "employer") {
        return res.status(403).json({
          status: "failed",
          message: "You are not authorized to insert categories!",
        });
      }

      const { categoryName, icon } = req.body;

      // Validate required fields
      if (!categoryName || !icon) {
        return res.status(400).json({
          status: "failed",
          message: "Category name and icon are required.",
        });
      }

      // Create and save category with postedById
      const category = new Category({ categoryName, icon, postedBy });
      const saveCategory = await category.save();

      return res.status(200).json({
        status: "success",
        message: "Category saved successfully.",
        saveCategory,
      });
    } catch (error) {
      console.error("Error inserting category:", error.message);
      return res.status(500).json({
        status: "failed",
        message: "Internal server error.",
      });
    }
  };
  static getallCategory = async (req, res) => {
    try {
      const data = await Category.find(); // Sort by createdAt in descending order (-1)
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      // console.log(error)
      res.status(400).json({ status: "failed", message: error.message });
    }
  };
  static getAllCategoryById = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res
          .status(400)
          .json({ status: "failed", message: "Job not found" });
      }
      const job = await Category.findById(id);
      return res.status(200).json({ status: "success", job });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: "failed", message: "Internal server error" });
    }
  };
  static JobGetByCategory = async (req, res) => {
    const { cName } = req.params;
    // console.log(cName)
    try {
      const categoryList = await jobModel.find({ category: cName });
      if (!categoryList) {
        return req.status(400).json({ message: "Category not found!" });
      }
      return res.status(200).json({
        success: true,
        categoryList,
      });
    } catch (error) {
      console.log(error.message);
      return res
        .status(400)
        .json({ status: "failed", message: "Internal server error!" });
    }
  };
  static getEmployerCategory = async (req, res) => {
    try {
      // Ensure req.UserData exists
      if (!req.UserData) {
        return res.status(401).json({
          status: "failed",
          message: "Unauthorized access. User data is missing.",
        });
      }

      const { role, _id, name } = req.UserData;

      // Authorization check
      if (role !== "employer") {
        return res.status(403).json({
          status: "failed",
          message: "You are not authorized to access this data.",
        });
      }

      // Validate query parameters for sorting
      const validSortFields = ["createdAt", "name", "updatedAt"];
      const sortBy = validSortFields.includes(req.query.sortBy)
        ? req.query.sortBy
        : "createdAt";
      const order = req.query.order === "desc" ? -1 : 1;

      // Fetch categories for the employer and apply sorting
      const category = await Category.find({ postedBy: _id }).sort({
        [sortBy]: order,
      });

      if (!category || category.length === 0) {
        return res.status(404).json({
          status: "failed",
          message: "No categories found for this employer.",
        });
      }

      return res.status(200).json({
        status: "success",
        message: `Categories posted by ${name}`,
        category,
      });
    } catch (error) {
      console.error("Error fetching employer categories:", error.message);
      return res.status(500).json({
        status: "failed",
        message: "Internal server error.",
      });
    }
  };
  static deleteCategory = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res
          .status(400)
          .json({ status: "failed", message: "Category not found" });
      }
      await Category.findByIdAndDelete(id);
      return res
        .status(200)
        .json({ status: "success", message: "Category deleted successfully" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: "failed", message: "Internal server error." });
    }
  };
}

module.exports = CategoryController;

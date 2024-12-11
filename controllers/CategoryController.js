const Category = require("../models/category");
const jobModel = require("../models/job.model");
class CategoryController {
  static CategoryInsert = async (req, res) => {
    try {
      const { categoryName, icon } = req.body;
      const result = new Category(req.body);

      if (!result) {
        return res
          .status(404)
          .json({ status: "fail", message: "category data not found" });
      }

      const saveCategory = await result.save();
      res.status(200).json({
        status: "success",
        message: "category save successfully",
        saveCategory,
      });
    } catch (error) {
      res.status(590).json({ status: "failed", message: error.message });
    }
  };
  static getallCategory = async (req, res) => {
    try {
      const data = await Category.find(); // Sort by createdAt in descending order (-1)
      res.status(200).json({
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
      const { role, _id, name } = req.UserData; // use req.UserData consistently
      if (role === "jobSeeker") {
        return res.status(400).json({
          status: "failed",
          message: "You are not authorized to access this data",
        });
      }
      // Fetch query parameters for sorting
      const sortBy = req.query.sortBy || "createdAt"; // Default sorting by createdAt
      const order = req.query.order === "desc" ? -1 : 1; // Default is ascending order (1), descending (-1)

      // Fetch jobs where the employer's ID matches the user's ID and apply sorting
      const jobs = await Category.find({ postedBy: _id }).sort({
        [sortBy]: order,
      });

      if (!jobs.length) {
        return res.status(404).json({
          status: "failed",
          message: "No Category found for this employer.",
        });
      }

      return res.status(200).json({
        status: "success",
        message: `Category Posted by ${name}`,
        jobs,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: "failed", message: "Internal server error." });
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

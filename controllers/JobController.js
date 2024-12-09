const jobModel = require("../models/job.model");

class JobController {
  static jobPosting = async (req, res) => {
    const { role } = req.UserData;
    if (role === "employer") {
      try {
        const {
          title,
          description,
          category,
          country,
          keySkill,
          location,
          jobType,
          fixedSalary,
          salaryFrom,
          salaryTo,
        } = req.body;

        // Check required fields
        if (
          !title ||
          !description ||
          !category ||
          !country ||
          !keySkill ||
          !jobType ||
          !location
        ) {
          return res
            .status(400)
            .json({ status: "failed", message: "All fields are required!" });
        }

        // Check salary inputs
        if ((!salaryFrom || !salaryTo) && !fixedSalary) {
          return res.status(400).json({
            status: "failed",
            message: "Please provide either salary range or fixed salary.",
          });
        }

        if (salaryFrom && salaryTo && fixedSalary) {
          return res.status(400).json({
            status: "failed",
            message: "Provide either salary range or fixed salary, not both.",
          });
        }

        // Job posting logic
        const postedBy = req.UserData._id;
        const jobPost = await jobModel.create({
          title,
          description,
          category,
          country,
          keySkill,
          jobType,
          location,
          salaryFrom,
          salaryTo,
          fixedSalary,
          postedBy,
        });

        // Respond with success
        return res.status(200).json({
          status: "success",
          message: "Job posted successfully.",
          jobPost,
        });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ status: "failed", message: "Internal server error" });
      }
    }

    // If user is not an employer
    return res.status(403).json({
      status: "failed",
      message: "You are not authorized to post a job!",
    });
  };

  static getJobById = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res
          .status(400)
          .json({ status: "failed", message: "Job not found" });
      }
      const job = await jobModel.findById(id);
      return res.status(200).json({ status: "success", job });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: "failed", message: "Internal server error" });
    }
  };

  static getEmployerJobs = async (req, res) => {
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
      const jobs = await jobModel
        .find({ postedBy: _id })
        .sort({ [sortBy]: order });

      if (!jobs.length) {
        return res.status(404).json({
          status: "failed",
          message: "No jobs found for this employer.",
        });
      }

      return res.status(200).json({
        status: "success",
        message: `Jobs Posted by ${name}`,
        jobs,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: "failed", message: "Internal server error." });
    }
  };

  static getAllJobs = async (req, res) => {
    try {
      // Extract sorting parameters from query (e.g., ?sort=createdAt&order=desc)
      const { sort = "createdAt", order = "desc" } = req.query;

      // Build the sort object for MongoDB
      const sortOrder = order === "asc" ? 1 : -1; // Ascending or descending order
      const sortOptions = { [sort]: sortOrder };

      // Fetch the jobs and sort by the specified field
      const jobList = await jobModel.find().sort(sortOptions);

      return res.status(200).json({
        status: "success",
        message: "List of jobs",
        data: jobList, // Return sorted jobs
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "failed",
        message: "Internal server error.",
      });
    }
  };

  static updateJob = async (req, res) => {
    try {
      const { role } = req.UserData;

      if (role === "jobSeeker") {
        return res.status(403).json({
          status: "failed",
          message: "You are not authorized to update jobs",
        });
      }

      const { id } = req.params;

      const job = await jobModel.findById(id);

      if (!job) {
        return res
          .status(404)
          .json({ status: "failed", message: "Job not found" });
      }

      const updatedJob = await jobModel.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      return res.status(200).json({
        status: "success",
        message: "Job updated successfully",
        updatedJob,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: "failed", message: "Internal server error" });
    }
  };

  static deleteJob = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res
          .status(400)
          .json({ status: "failed", message: "Job not found" });
      }
      await jobModel.findByIdAndDelete(id);
      return res
        .status(200)
        .json({ status: "success", message: "Job deleted successfully" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: "failed", message: "Internal server error." });
    }
  };
}
module.exports = JobController;

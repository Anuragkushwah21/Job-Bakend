const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    keySkill: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    fixedSalary: {
      type: String,

    },
    salaryFrom: {
      type: String,

    },
    salaryTo: {
      type: String,

    },
    jobPostedOn: {
      type: Date,
      default: Date.now,
    },
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    expired: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const jobModel = mongoose.model("job.model", JobSchema);
module.exports = jobModel;

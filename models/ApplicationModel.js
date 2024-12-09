const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    coverLetter: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    applicantID: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      role: {
        type: String,
        required: true,
        enum: ["jobSeeker"],
      },
    },
    employerID: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      role: {
        type: String,
        required: true,
        enum: ["employer"],
      },
    },
    resume: {
      public_id: {
        type: String,
        required: true,
      },
      url: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const ApplicationModel = mongoose.model("Application", ApplicationSchema);
module.exports = ApplicationModel;

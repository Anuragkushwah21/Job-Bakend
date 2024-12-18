const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model("category", categorySchema);
module.exports = CategoryModel;

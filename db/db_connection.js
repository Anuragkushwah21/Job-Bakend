const mongoose = require("mongoose");

const database = async () => {
  try {
    // await mongoose.connect(process.env.LIVE_URL);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection error:", error.message);
  }
};

module.exports = database;

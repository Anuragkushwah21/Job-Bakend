const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true,
        default: "jobSeeker",
    },
    password: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const userModel = mongoose.model("user.model", userSchema);
module.exports = userModel;

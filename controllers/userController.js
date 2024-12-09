const userModel = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class userController {
  static signUp = async (req, res) => {
    try {
      const { name, email, password, phone, role, confirmPassword } = req.body;
      console.log(req.body);
      // Check if all fields are provided
      if (!name || !email || !password || !phone || !role || !confirmPassword) {
        return res
          .status(400)
          .json({ status: "failed", message: "All fields are required!" });
      }

      // Check if password and confirm password match
      if (password !== confirmPassword) {
        return res
          .status(400)
          .json({ status: "failed", message: "Password doesn't match" });
      }

      // Check if the user already exists
      const existingUser = await userModel.findOne({ email: email });
      if (existingUser) {
        return res
          .status(400)
          .json({ status: "failed", message: "Email already exists" });
      }

      // Check if the phone number already exists
      const phoneNo = await userModel.findOne({ phone });
      if (phoneNo) {
        return res
          .status(400)
          .json({ status: "failed", message: "Phone number already exists" });
      }

      // Hashing the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const userData = await userModel.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role,
      });

      // Generating token and storing in cookies
      const token = jwt.sign({ ID: userData._id }, process.env.JWT_SECRET);
      res.cookie("token", token, { httpOnly: true });

      // Return the created user data or a success message
      return res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: userData,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: "failed", message: "Internal server error" });
    }
  };

  static signIn = async (req, res) => {
    try {
      const { email, password, role } = req.body;

      // Check if all fields are provided
      if (!email || !password || !role) {
        return res
          .status(400)
          .json({ status: "failed", message: "All fields are required!" });
      }

      //check user role
      const user = await userModel.findOne({ email, role });
      if (!user) {
        return res.status(400).json({
          status: "failed",
          message: "User not found. Please check user role",
        });
      }

      //check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ status: "failed", message: "Invalid email or password" });
      }

      //generating token and storing in cookie
      const token = jwt.sign({ ID: user._id }, process.env.JWT_SECRET);
      res.cookie("token", token, { httpOnly: true });
      
      //matching the user role
      if (user.role === "jobSeeker") {
        return res.status(200).json({
          status: "success",
          message: "JobSeeker Logged In successfully",
        });
      } else if (user.role === "employer") {
        return res.status(200).json({
          status: "success",
          message: "Employer Logged In successfully",
        });
      } else {
        return res.status(400).json({
          status: "failed",
          message: "Unknown user role. Please check your role!",
        });
      }
    } catch (error) {
      console.log(error, "Internal server error");
      return res.status(500).json({
        status: "failed",
        message: "Internal server error. Try again!",
      });
    }
  };

  static getUser = async (req, res) => {
    try {
      const { id } = req.UserData;
      const data = await userModel.findById(id);
      return res
        .status(200)
        .json({ status: "success", message: "user details found", data });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: "failed", message: "Internal server error." });
    }
  };

  static signOut = async (req, res) => {
    try {
      //clearing the token from the cookie
      res.clearCookie("token");
      return res
        .status(200)
        .json({ status: "success", message: "Logged out successfully!" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "failed", message: "Internal server error" });
    }
  };
  static updatePassword = async (req, res) => {
    try {
      // console.log(req.userdata)
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const { id } = req.UserData;
      if (oldPassword && newPassword && confirmPassword) {
        const user = await userModel.findById(id);
        const isMatched = await bcrypt.compare(oldPassword, user.password);
        // console.log(isMatched)
        if (!isMatched) {
          res.status(401).json({
            status: "failed",
            message: "current password is incorrect",
          });
        } else {
          if (newPassword != confirmPassword) {
            res
              .status(401)
              .json({ status: "failed", message: "password does not match" });
          } else {
            const newHashPassword = await bcrypt.hash(newPassword, 10);
            await userModel.findByIdAndUpdate(id, {
              password: newHashPassword,
            });
            res.status(201).json({
              status: "success",
              message: "password updated successfully",
            });
          }
        }
      } else {
        res
          .status(401)
          .json({ status: "failed", message: "all fields are required" });
      }
    } catch (error) {
      console.log(error);
    }
  };
  static updateProfile = async (req, res) => {
    try {
      const { id } = req.UserData;
      const { name, email, image } = req.body;
      if (req.files) {
        const user = await userModel.findById(id);
        const imageID = user.image.public_id;

        // delete image from cloudinary
        await cloudinary.uploader.destroy(imageID);
        // new image
        const imageFile = req.files.image;
        const imageUpload = await cloudinary.uploader.upload(
          imageFile.tempFilePath,
          {
            folder: "profileApiImage",
          }
        );

        var data = {
          name: name,
          email: email,
          image: {
            public_id: imageUpload.public_id,
            url: imageUpload.secure_url,
          },
        };
      } else {
        var data = {
          name: name,
          email: email,
        };
      }

      const updateUserProfile = await userModel.findByIdAndUpdate(id, data);
      res.status(200).json({
        success: true,
        updateUserProfile,
      });
    } catch (error) {}
  };
}
module.exports = userController;

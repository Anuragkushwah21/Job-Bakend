const userModel = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class userController {
  static signUp = async (req, res) => {
    try {
      const { name, email, password, phone, role, confirmPassword } = req.body;

      // Validate required fields
      if (!name || !email || !password || !phone || !role || !confirmPassword) {
        return res.status(400).json({
          status: "failed",
          message: "All fields are required!",
        });
      }

      // Check password match
      if (password !== confirmPassword) {
        return res.status(400).json({
          status: "failed",
          message: "Password doesn't match",
        });
      }

      // Check if email already exists
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: "failed",
          message: "Email already exists",
        });
      }

      // Check if phone already exists
      const phoneNo = await userModel.findOne({ phone });
      if (phoneNo) {
        return res.status(400).json({
          status: "failed",
          message: "Phone number already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const userData = await userModel.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role,
      });

      // Generate JWT token
      const token = jwt.sign({ id: userData._id }, process.env.JWT_SECRET, {
        expiresIn: "7d", // optional: token expiry
      });

      // Set token as HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // only on HTTPS in production
        sameSite: "Lax",
      });

      // Send response including token and user
      return res.status(201).json({
        status: "success",
        message: "User registered successfully",
        token, // ✅ include token here
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
        return res.status(400).json({
          status: "failed",
          message: "All fields are required!",
        });
      }

      // Find user with matching email and role
      const user = await userModel.findOne({ email, role });
      if (!user) {
        return res.status(400).json({
          status: "failed",
          message: "User not found. Please check user role",
        });
      }

      // Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid email or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d", // optional: token expiry
      });

      // Set token as HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // only send on HTTPS in production
        sameSite: "Lax",
      });

      // Send response based on user role with token
      if (user.role === "jobSeeker") {
        return res.status(200).json({
          status: "success",
          message: "JobSeeker Logged In successfully",
          token, // ✅ include token in response
          data: user,
        });
      } else if (user.role === "employer") {
        return res.status(200).json({
          status: "success",
          message: "Employer Logged In successfully",
          token, // ✅ include token in response
          data: user,
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
       const token = req.cookies.token;
      const data = await userModel.findById(id);
      return res
        .status(200)
        .json({ status: "success", message: "user details found", data, token: token, });
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
  static sendResetPasswordMail = async (name, email, token) => {
    try {
      let transporter = await nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: "anuragkofficial21@gmail.com",
          pass: "bjlgmcajfhsvpwwz",
        },
      });
      let mailOptions = {
        from: "test@gmail.com", // sender address
        to: email, // list of receivers
        subject: "For Reset Password", // Subject line
        text: "hello", // plain text body
        html:
          "<p>Hii " +
          name +
          ',Please click here to <a href="http://localhost:5173/reset-password?token=' +
          token +
          '">Reset</a>Your Password.',
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          res
            .status(200)
            .send({ success: true, message: "Mail Has been sent." });
        }
      });
    } catch (error) {
      {
        res
          .status(200)
          .send({ success: true, message: "This email does't exits." });
      }
    }
  };
  static ForgotPassword = async (req, res) => {
    try {
      const email = req.body.email;
      const userData = await userModel.findOne({ email: email });
      if (userData) {
        const randomString = randomstring.generate();
        const data = await userModel.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        this.sendResetPasswordMail(userData.name, userData.email, randomString);
        res.status(200).send({
          success: true,
          message: "Please Check Your Inbox of Mail and Reset Your Password.",
        });
      } else {
        res
          .status(200)
          .send({ success: true, message: "This email does't exits." });
      }
    } catch (error) {
      res.status(400).send({ success: false, message: error.message });
    }
  };
  static ResetPassword = async (req, res) => {
    try {
      const token = req.query.token;
      const tokenData = await userModel.findOne({ token: token });
      if (tokenData) {
        const password = req.body.password;
        const hashPassword = await bcrypt.hash(password, 10);
        const userData = await userModel.findByIdAndUpdate(
          { _id: tokenData._id },
          { $set: { password: hashPassword, token: "" } },
          { new: true }
        );
        res.status(200).send({
          success: true,
          message: "User Password Has been Updated Successfully",
          data: userData,
        });
      } else {
        res
          .status(400)
          .send({ success: true, message: "This Link Has been Expired" });
      }
    } catch (error) {
      res.status(400).send({ success: true, message: error.message });
    }
  };
}
module.exports = userController;

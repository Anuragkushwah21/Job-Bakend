const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model.js");

const verifyToken = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    res.status(401).json({ status: "failed", message: "Unauthorized Login!" });
  } else {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const userData = await userModel.findOne({ _id: data.ID });
    req.UserData = userData;
    next();
  }
};
module.exports = verifyToken;

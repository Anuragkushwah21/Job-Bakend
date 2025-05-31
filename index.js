const express = require("express");
const dotenv = require("dotenv");
dotenv.config({path:'./.env'});
const database = require("./db/db_connection");
const route = require("./routes/path.js")
const cookieParser = require("cookie-parser")
const cloudinary=require("cloudinary").v2
// Connect to database
database();
const cors = require("cors");


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLINT_NAME,
    api_key:process.env.CLOUDINARY_CLINT_API,
    api_secret:process.env.CLOUDINARY_CLINT_SECRET,
  });


const app = express();


// app.use(cors(
//   {
//     origin: "https://pnjobportal.netlify.app",
//     credentials:true,
//   }
// ));
app.use(cors(
  {
    origin: "http://localhost:5173",
    credentials:true,
  }
));

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//for api communication in react
//file upload call 
const fileupload = require("express-fileupload");
//file upload
app.use(fileupload({ useTempFiles: true }));







app.use("/api", route)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

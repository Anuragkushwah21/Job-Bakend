const express = require("express")
const userController = require("../controllers/userController")
const verifyToken = require("../middleware/verifyToken")
const JobController = require("../controllers/JobController")
const ApplicationController = require("../controllers/ApplicationController")
const CategoryController = require("../controllers/CategoryController")
const route = express.Router()

// user routes
route.post('/signUp', userController.signUp)
route.post('/signIn', userController.signIn)
route.get("/getUser", verifyToken, userController.getUser)
route.post('/signOut', verifyToken, userController.signOut)
route.post('/updatePassword', verifyToken, userController.updatePassword)
route.post('/updateProfile', verifyToken, userController.updateProfile)


// jobs route
route.post("/jobPost", verifyToken, JobController.jobPosting)
route.get("/employerJobs", verifyToken, JobController.getEmployerJobs)
route.get("/jobList", verifyToken, JobController.getAllJobs)
route.get("/job/:id", verifyToken, JobController.getJobById)
route.delete("/delete/:id", verifyToken, JobController.deleteJob)
route.put("/update/:id", verifyToken, JobController.updateJob)

//ApplicationModel
route.post('/postApplication',verifyToken,ApplicationController.postApplication)
route.get('/employer/getall',verifyToken,ApplicationController.employerGetAllApplications)
route.get('/jobSeeker/getall',verifyToken,ApplicationController.jobSeekerGetAllApplications)
route.delete('/jobSeekerDelete/:id',verifyToken,ApplicationController.jobSeekerDeleteApplication)

// Category Route
route.post('/categoryInsert',verifyToken,CategoryController.CategoryInsert)
route.get('/getallCategory',verifyToken,CategoryController.getallCategory)
route.get('/getCategoryById/:id',verifyToken,CategoryController.getAllCategoryById)
route.get("/categoryJob/:cName", verifyToken, CategoryController.JobGetByCategory)

module.exports = route
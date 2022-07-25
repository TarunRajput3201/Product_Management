let express = require("express")
let router = express.Router()
let {profileImageLink}=require("../controllers/awsController")
let {createUser,userLogin,getUser}=require("../controllers/userController")

router.post("/register",profileImageLink,createUser)
router.post("/login",userLogin)
router.get("/user/:userId/profile",getUser)
router.put("/user/:userId/profile")











module.exports = router;
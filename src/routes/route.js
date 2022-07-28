let express = require("express")
let router = express.Router()
let {createUser,userLogin,getUser, Updateprofile}=require("../controllers/userController")
let {createProduct,getProduct,getProductById,deleteProductById}=require("../controllers/productController")
const { authentication } = require("../middleware/auth")

router.post("/register",createUser)
router.post("/login",userLogin)
router.get("/user/:userId/profile",authentication,getUser)
router.put("/user/:userId/profile", authentication,Updateprofile)

router.post("/products",createProduct)
router.get("/products",getProduct)
router.get("/products/:productId",getProductById)
router.delete("/products/:productId",deleteProductById)

router.all("/**",function(req,res){
    return res.status(404).send({status:false,message:"No such api found"})
})


module.exports = router;
let express = require("express")
let router = express.Router()
let {createUser,userLogin,getUser, Updateprofile}=require("../controllers/userController")
let {createProduct,getProduct,getProductById,updateProduct,deleteProductById}=require("../controllers/productController")
let {createCart,updateCart,getCart,deleteCart}=require("../controllers/cartController")
const { authentication } = require("../middleware/auth")

router.post("/register",createUser)
router.post("/login",userLogin)
router.get("/user/:userId/profile",authentication,getUser)
router.put("/user/:userId/profile", authentication,Updateprofile)

router.post("/products",createProduct)
router.get("/products",getProduct)
router.get("/products/:productId",getProductById)
router.put("/products/:productId",updateProduct)
router.delete("/products/:productId",deleteProductById)

router.post("/users/:userId/cart",createCart)
router.put("/users/:userId/cart",updateCart)
router.get("/users/:userId/cart",getCart)
router.delete("/users/:userId/cart",deleteCart)

router.all("/**",function(req,res){
    return res.status(404).send({status:false,message:"No such api found"})
})


module.exports = router;
const express = require("express")
const router = express.Router()
const {createUser,userLogin,getUser, Updateprofile}=require("../controllers/userController")
const {createProduct,getProduct,getProductById,updateProduct,deleteProductById}=require("../controllers/productController")
const {createCart,updateCart,getCart,deleteCart}=require("../controllers/cartController")
const {createOrder,updateOrder}=require("../controllers/orderController")
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

router.post("/users/:userId/cart",authentication,createCart)
router.put("/users/:userId/cart",authentication,updateCart)
router.get("/users/:userId/cart",authentication,getCart)
router.delete("/users/:userId/cart",authentication,deleteCart)

router.post("/users/:userId/orders",createOrder)
router.put("/users/:userId/orders",updateOrder)

router.all("/**",function(req,res){
    return res.status(404).send({status:false,message:"No such api found"})
})


module.exports = router;
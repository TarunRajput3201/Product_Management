const cartModel=require("../models/cartModel")
const productModel=require("../models/productModel")
const userModel=require("../models/userModel")
const { validateString,
    validateRequest,  
    validNumber, 
    imageExtValidator,
    validateObjectId,
    onlyWholeNumbers,
    decNumbers,
validateNumber} = require("../validator/validations")


let createCart=async function(req,res){
    try{let id=req.params.userId
    if(!validateObjectId(id)){return res.status(400).send({status:false,message:"please provide valid userId"})}
    
    let tokenUserId=req.user.userId
    if(tokenUserId!==id){return res.status(403).send({status:false,message:"authorization failed"})}

    let bodyData=req.body
    if(validateRequest(bodyData)){return res.status(400).send({status:false,message:"please provide data in body"})}
    
    let {productId,cartId}=bodyData
    
   
    // console.log(userId)

    
    // console.log(productId)
    if(!productId){return res.status(400).send({status:false,message:"please provide productId"})}
        if(!validateObjectId(productId)){return res.status(400).send({status:false,message:"please provide a valid productId in items"})}
        
       

        let user=await userModel.findOne({_id:id})
        if(!user){return res.status(404).send({status:false,message:"user with this userId not found"})}

        let product=await productModel.findOne({_id:productId})
        if(!product){return res.status(404).send({status:false,message:"product with this productId not found"})}

      

    let cart=await cartModel.findOne({userId:id})
    if(!cart){
        let obj={
            "userId":id,
             "items":[{
                "productId":productId,
                "quantity":1
             }],
         "totalPrice":product.price,
             "totalItems":1
        }
        let cartCreated=await cartModel.create(obj)
         let response={"_id":cartCreated._id,
            "userId":cartCreated.userId,
         "items":[{
            "productId":cartCreated.items[0].productId,
            "quantity":cartCreated.items[0].quantity
         }],
         "totalPrice":cartCreated.totalPrice,
         "totalItems":cartCreated.totalItems
        }
        res.status(201).send({status:true,message:"cart created successfully", data:response})
    }
    else{
        
        // if( cartId && cart._id!=cartId){return res.status(404).send({status:false,message:"cartId provided doesnot belongs to this user"})}
        if(cart.items.length>0){
        let noProductId=true
            for(let i=0;i<cart.items.length;i++){
            if(cart.items[i].productId==productId){
                cart.items[i].quantity++
               noProductId=false
            }
            
        }
       if(noProductId){
        items[0].quantity=1
        cart.items.push(items[0])
        
       }
       
    }
    else{ items[0].quantity=1
        cart.items.push(items[0])}
       
    
    
      cart.totalPrice=cart.totalPrice+product.price
       cart.totalItems=cart.items.length
       cart.save()
       

       res.status(200).send({status:true,data:cart})
    }
        
        }
     catch(err){
            return res.status(500).send({sttus:false,message:err.message})
        } 
        
}





let updateCart=async function(req,res){
    try{
        let userId=req.params.userId
        if(!validateObjectId(userId)){return res.status(400).send({status:false,message:"please provide valid userId"})}
        
        let tokenUserId=req.user.userId
        if(tokenUserId!==userId){return res.status(403).send({status:false,message:"authorization failed"})}

        let bodyData=req.body
        let {productId,cartId,removeProduct}=bodyData

        if(!productId){return res.status(400).send({status:false,message:"please provide productId"})}
        if(!validateObjectId(productId)){return res.status(400).send({status:false,message:"please provide valid productId"})}
        
        if(!cartId){return res.status(400).send({status:false,message:"please provide cartId"})}
        if(!validateObjectId(cartId)){return res.status(400).send({status:false,message:"please provide valid cartId"})}
         
        let user=await userModel.findById(userId)
        if(!user){return res.status(404).send({status:false,message:"user with this userId not found"})}

        let cart =await cartModel.findOne({userId:userId,_id:cartId},{__v:0,createdAt:0,updatedAt:0,_id:0}).lean()
        if(!cart){return res.status(404).send({status:false,message:"cart with this userId not found"})}

        
        if("removeProduct" in bodyData){
            
            if(removeProduct==0){
            for(let i=0;i<cart.items.length;i++){
                if(cart.items[i].productId==productId){
                    cart.items.splice(i,1)
                }
            }}
            else if(removeProduct==1){
                for(let i=0;i<cart.items.length;i++){
                    if(cart.items[i].productId==productId){
                        if(cart.items[i].quantity==1){
                            cart.items.splice(i,1)
                        }
                        else{
                            cart.items[i].quantity--
                        }

                    }
                }

            }
           else{return res.status(400).send({status:false,message:"please provide only 0 or 1"}) }
        }

        let updateCart=await cartModel.findOneAndUpdate({userId:userId,_id:cartId},{$set:cart},{new:true})
        res.status(200).send({status:true,data:updateCart})
    }
    catch(err){
        return res.status(500).send({sttus:false,message:err.message})
    }
}

let getCart =async function(req,res){
    try{let userId=req.params.userId
    if(!validateObjectId(userId)){return res.status(400).send({status:false,message:"please provide valid userId"})}
    
    let tokenUserId=req.user.userId
    if(tokenUserId!==userId){return res.status(403).send({status:false,message:"authorization failed"})}

    let user=await userModel.findById(userId)
    if(!user){return res.status(404).send({status:false,message:"user with this userId not found"})}

    let cart=await cartModel.findOne({userId:userId})
    if(!cart){return res.status(404).send({status:false,message:"cart with this userId not found"})}

    

    res.status(200).send({status:true,data:cart})


}
    catch(err){
        return res.status(400).send({sttus:false,message:err.message})
    } 
}

let deleteCart =async function(req,res){
    try{let userId=req.params.userId
    if(!validateObjectId(userId)){return res.status(400).send({status:false,message:"please provide valid userId"})}
        
    let tokenUserId=req.user.userId
    if(tokenUserId!==userId){return res.status(403).send({status:false,message:"authorization failed"})}
    
    let user=await userModel.findById(userId)
    if(!user){return res.status(404).send({status:false,message:"user with this userId not found"})}

    let cart =await cartModel.findOne({userId:userId})
    if(!cart){return res.status(404).send({status:false,message:"cart with this userId not found"})}

    cart.items=[]
    cart.totalPrice=0
    cart.totalItems=0
    
    cart.save()

    res.status(204).send({status:true,data:cart})


}
    catch(err){
        return res.status(400).send({sttus:false,message:err.message})
    } 
}

module.exports={createCart,updateCart,getCart,deleteCart}

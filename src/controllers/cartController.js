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

// let createCart=async function(req,res){
//    try{let id=req.params.userId
//    if(!validateObjectId(id)){return res.status(400).send({status:false,message:"please provide valid userId"})}
   
//    let bodyData=req.body
//    if(validateRequest(bodyData)){return res.status(400).send({status:false,message:"please provide data in body"})}
   
//    let {userId,items,totalPrice,totalItems}=bodyData

    // userId=id

    // if(items.length==0){return res.status(400).send({status:false,message:"please add atleast one product"})}
    
    // let [{productId,quantity}]=items

    
    //     if(!productId){return res.status(400).send({status:false,message:"please provide productId in items"})}
    //     if(!validateObjectId(productId)){return res.status(400).send({status:false,message:"please provide a valid productId in items"})}
        
    //     if(!quantity){return res.status(400).send({status:false,message:"please provide quantity in items"})}
    //     if(quantity===0){return res.status(400).send({status:false,message:"please provide atleast 1 quantity for the product in items"})}

    
    // let cartPresent=await cartModel.findOne({userId:userId}).lean()
    // if(cartPresent){
    //   if(cartPresent.items.length>0){
    //     for(let i=0;i<cartPresent.items.length;i++){
    //     if(cartPresent.items[i][productId]==productId){
    //        quantity++
    //     }
    //     else{
    //        items[0].push(cartPresent.items[i])
    //     }
    // }
    //   }
    // }
   

    // let totalprice=0
    // for(let i=0;i<items.length;i++){
    //     let product=await productModel.findOne({_id:items[i][productId],isDeleted:false})
    //     if(!product){return res.status(404).send({status:false,message:"product with this productId doesnot exists or deleted"})}

    //     totalprice=totalprice+((product.price)*(items[i][quantity]))
    // }
    // totalPrice=totalprice

    // totalItems=items.length

     

//     let isUserExists=await userModel.findById(userId)
//     if(!isUserExists){return res.status(404).send({status:false,message:"user with this userId doesnot exists"})}

//     let cart=await cartModel.create(bodyData)
//     res.status(201).send({status:true,message:"cart created successfully",data:cart})
// }
// catch(err){
//     return res.status(500).send({sttus:false,message:err.message})
// } 

// }

let createCart=async function(req,res){
    try{let id=req.params.userId
    if(!validateObjectId(id)){return res.status(400).send({status:false,message:"please provide valid userId"})}
    
    let bodyData=req.body
    if(validateRequest(bodyData)){return res.status(400).send({status:false,message:"please provide data in body"})}
    
    let {userId,items,totalPrice,totalItems}=bodyData
    
   
    // console.log(userId)

    let[{productId,quantity}]=items
    // console.log(productId)
    if(!productId){return res.status(400).send({status:false,message:"please provide productId in items"})}
        if(!validateObjectId(productId)){return res.status(400).send({status:false,message:"please provide a valid productId in items"})}
        
        if(!quantity){return res.status(400).send({status:false,message:"please provide quantity in items"})}
        if(!validateNumber(quantity)){return res.status(400).send({status:false,message:"quantity should be a number"})}
        if(quantity==0){return res.status(400).send({status:false,message:"please provide atleast 1 quantity for the product in items"})}
      

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
                "quantity":quantity
             }],
             "totalPrice":product.price*quantity,
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
        if(cart.items.length>0){
        
            for(let i=0;i<cart.items.length;i++){
            if(cart.items[i].productId==productId){
                cart.items[i].quantity=cart.items[i].quantity+quantity
               break
            }
            
               
        }
       
        // cart.items.push(items[0])
       }
       cart.totalPrice=cart.totalPrice+(product.price*quantity)
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

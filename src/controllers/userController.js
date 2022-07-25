const { findOne } = require("../models/userModel")
const userModel=require("../models/userModel")
const{validateString,validateNumber,validateRequest,validateEmail,regexNumber,regxName,isValidPincode}=require("../validator/validations")
const mongoose=require("mongoose")
const bcrypt=require("bcrypt")

let createUser=async function(req,res){
    try{ let bodyData=req.body
    let {address}=bodyData
    address=JSON.parse(address)
   
    let obj={}

    if(bodyData==undefined|| bodyData==null){return res.status(400).send({status:false,message:"please provide the bodyData in body"})}

    if(!validateString(bodyData.fname)){return res.status(400).send({status:false,message:"please provide the first name"})}
    if(!regxName(bodyData.fname)){return res.status(400).send({status:false,message:"please provide a valid first name"})}
    obj.fname=bodyData.fname

    if(!validateString(bodyData.lname)){return res.status(400).send({status:false,message:"please provide the last name"})}
    if(!regxName(bodyData.lname)){return res.status(400).send({status:false,message:"please provide a valid last name"})}
    obj.lname=bodyData.lname

    if(!validateString(bodyData.email)){ return res.status(400).send({status:false,message:"please provide the email"})}
    if(!validateEmail(bodyData.email)){return res.status(400).send({status:false,message:"please provide a valid email"})}
    let isDuplicateEmail=await userModel.findOne({email:bodyData.email})
    if(isDuplicateEmail){return res.status(400).send({status:false,message:"this email already exists"})}
    obj.email=bodyData.email

     if(!validateString(bodyData.profileImage)){return res.status(400).send({status:false,message:"please provide the profileImage"})}
     let uploadedFileURL=req.xyz
     obj.profileImage=uploadedFileURL

    if(!validateString(bodyData.phone)){return res.status(400).send({status:false,message:"please provide the phone number"})}
    if(!regexNumber(bodyData.phone)){return res.status(400).send({status:false,message:"please provide a valid phone number"})}
    let isDuplicatePhone=await userModel.findOne({phone:bodyData.phone})
    if(isDuplicatePhone){return res.status(400).send({status:false,message:"this phone number already exists"})}
    obj.phone=bodyData.phone

    if(!validateString(bodyData.password)){return res.status(400).send({status:false,message:"please provide the password"})}
    if(bodyData.password.length<8 || bodyData.password.length>15){return res.status(400).send({status:false,message:"password must be between 8-15"})}
    const salt = await bcrypt.genSalt(13);
    const encryptedPassword = await bcrypt.hash(bodyData.password, salt);
    obj.password=encryptedPassword
    
    
    if(!validateRequest(address)){return res.status(400).send({status:false,message:"please provide the bodyData in body"})}
    
    if (!validateRequest(address)) {
        return res.status(400).send({ status: false, message: "Invalid address" });
    }

    const { shipping, billing } = address;

    if (!validateRequest(shipping)) {
        return res.status(400).send({ status: false, message: "Shipping address is required" });
    } else {
        let { street, city, pincode } = shipping;

        if (!validateString(street)) {
            return res.status(400).send({ status: false, message: "Shipping address: street name is required " });
        }
        
        if (isValidPincode(pincode)) {
            return res.status(400).send({ status: false, message: "Shipping address: pin code should be valid like: 335659 " });
        }

        if (!validateString(city)) {
            return res.status(400).send({ status: false, message: "Shipping address: city name is required " });
        }
    }

    if (!validateRequest(billing)) {
        return res.status(400).send({ status: false, message: "Billing address is required" });
    }
    else {
        let { street, city, pincode } = billing;

        if (!validateString(street)) {
            return res.status(400).send({ status: false, message: "Billing address: street name is required " });
        }

        if (isValidPincode(pincode)) {
            return res.status(400).send({ status: false, message: "Billing address: pin code should be valid like: 335659 " });
        }

        if (!validateString(city)) {
            return res.status(400).send({ status: false, message: "Shipping address: city name is required ", });
        }

    }
    obj.address=address

    let data=await userModel.create(obj)
    res.status(201).send({status:true,message:"user registered successfully",data:data})
    }
    catch(err){
        
        return res.status(500).send({status:false,message:err.message})

    }
}



let userLogin = async function (req,res) {
    try {
        let email = req.body.email
        let password = req.body.password
        if (!validateString(email)) {
            return res.status(400).send({ status: false, message: "email is required" })
        }
        if (!validateString(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        }
        bcrypt.compare(password, hash, function(err, result) {
            if (!result) {
            return res.status(400).send({status:false,message:"invalid password"})
            }
          });

        let user = await userModel.findOne({ email: email, password: password });
        if (!user)
            return res.status(400).send({
                status: false,
                message: "email or the password is not correct",
            });
        let token = jwt.sign(
            {
                userId: user._id.toString(),
                iat: new Date().getTime(),
                exp: new Date().setDate(new Date().getDate() + 1)
            },
            "functionup-radon"
        );

        res.status(200).send({ status: true, message: "Success", data:{userId:user._id ,token:token }});
    }
    catch (err) {

        return res.status(500).send({ status: false, message: err.message })
    }
}

let getUser = async function (req,res) {
    try {
        let userId = req.params.userId

        if (!mongoose.isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "please enter valid userId" }) }
        let getUserDoc = await userModel.findById(userId)
        if (!getUserDoc) { return res.status(404).send({ status: false, message: "No such user is available" }) }

        res.status(200).send({status:true,message:"User profile details",data:getUserDoc})

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
const Updateprofile=async function(req,res){
    try{
        let userId=req.params.userId
        if(!mongoose.isValidObjectId(userId)){return res.status(400).send({ status: false, msg: "pleade provide valid id" });
    }
 let data=req.body
    
 if(Object.keys(data).length===0){ return res.status(400).send({ status: false, msg: "body can not be black" });
}
     
 const userData=await userModel.findOneAndUpdate({id:userId},{$set:data})
    res.status(200).send({status: true,data:userData})
}
catch(err){
    res.status(500).send({status:false,error:err.message})
}
}
module.exports={createUser,userLogin,getUser,Updateprofile}
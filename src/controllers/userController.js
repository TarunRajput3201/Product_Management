const { findOne } = require("../models/userModel")
const userModel=require("../models/userModel")
const{validateString,validateNumber,validateRequest,validateEmail,regexNumber,regxName}=require("../validator/validations")
const mongoose=require("mongoose")
const bcrypt=require("bcrypt")

let createUser=async function(req,res){
    try{ let bodyData=req.body
    let {address}=bodyData

    console.log(bodyData)
    let a=JSON.parse(address)
    console.log(a)
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

    //  if(!validateString(bodyData.profileImage)){return res.status(400).send({status:false,message:"please provide the profileImage"})}
     let uploadedFileURL=req.xyz
     obj.profileImage=uploadedFileURL

    if(!validateString(bodyData.phone)){return res.status(400).send({status:false,message:"please provide the phone number"})}
    if(!regexNumber(bodyData.phone)){return res.status(400).send({status:false,message:"please provide a valid phone number"})}
    let isDuplicatePhone=await userModel.findOne({phone:bodyData.phone})
    if(isDuplicatePhone){return res.status(400).send({status:false,message:"this phone number already exists"})}
    obj.phone=bodyData.phone

    if(!validateString(bodyData.password)){return res.status(400).send({status:false,message:"please provide the password"})}
    if(bodyData.password.length<8 || bodyData.password.length>15){return res.status(400).send({status:false,message:"password must be between 8-15"})}
    let saltRounds = 10;
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(bodyData.password, salt, function(err, hash) {
            obj.password=hash
         });
      });
    
    
    if(!validateRequest(address)){return res.status(400).send({status:false,message:"please provide the bodyData in body"})}
    
    if(!validateRequest(address.shipping)){return res.status(400).send({status:false,message:"please provide the data in body"})}

    if(!validateString(address.shipping.street)){return res.status(400).send({status:false,message:"please provide the street in shipping address"})}
    obj.address.shipping.street=bodyData.address.shipping.street

    if(!validateString(address.shipping.city)){return res.status(400).send({status:false,message:"please provide the city in shipping address"})}
    obj.address.shipping.city=bodyData.address.shipping.city
    
    if(!address.shipping.pincode){return res.status(400).send({status:false,message:"please provide the pincode in shipping address"})}
    if(!validateNumber(address.shipping.pincode)){return res.status(400).send({status:false,message:"please provide a valid shipping pincode"})}
    if(address.billing.pincode.toString().length!==6){return res.status(400).send({status:false,message:"pincode must be 6 digits"})}
    obj.address.shipping.pincode=address.shipping.pincode

    if(!validateRequest(address.billing)){return res.status(400).send({status:false,message:"please provide the data in body"})}

    if(!validateString(address.billing.street)){return res.status(400).send({status:false,message:"please provide the street in billing address"})}
    obj.address.billing.street=address.billing.street

    if(!validateString(address.billing.city)){return res.status(400).send({status:false,message:"please provide the city in billing address"})}
    obj.address.shipping.city=bodyData.address.shipping.city
    
    if(!address.billing.pincode){return res.status(400).send({status:false,message:"please provide the pincode in billing address"})}
    if(!validateNumber(address.billing.pincode)){return res.status(400).send({status:false,message:"please provide a valid billing pincode"})}
    if(address.billing.pincode.toString().length!==6){return res.status(400).send({status:false,message:"pincode must be 6 digits"})}
    obj.address.billing.pincode=address.billing.pincode

    let data=await userModel.create(obj)
    res.status(201).send({status:true,message:"user registered successfully",data:data})
    }
    catch(err){
        console.log(err)
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

module.exports={createUser,userLogin,getUser}
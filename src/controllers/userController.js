const userModel = require("../models/userModel")
const { uploadFile } = require("../controllers/awsController")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt=require("jsonwebtoken")
const { validateString, validateNumber, validateRequest, validateEmail, regexNumber, regxName, isValidPincode, validatePassword,imageExtValidator} = require("../validator/validations")

let createUser = async function (req, res) {
    try {
        let data = req.body
        let uploadedFileURL = req.xyz
        data.profileImage = uploadedFileURL
        let { address, fname, lname, email, password, phone } = data
      try{ address = JSON.parse(address)
      }catch(err){return res.status(400).send({ status: false, message: "please provide valid pincode or type data correctly" })}

        if (validateRequest(data)) { return res.status(400).send({ status: false, message: "please provide the data in the body" }) }
        if (!validateString(fname)) { return res.status(400).send({ status: false, message: "please provide the first name" }) }
        if (!regxName(fname)) { return res.status(400).send({ status: false, message: "please provide a valid first name" }) }
        if (!validateString(lname)) { return res.status(400).send({ status: false, message: "please provide the last name" }) }
        if (!regxName(lname)) { return res.status(400).send({ status: false, message: "please provide a valid last name" }) }
        if (!validateString(email)) { return res.status(400).send({ status: false, message: "please provide the email" }) }
        if (!validateEmail(email)) { return res.status(400).send({ status: false, message: "please provide a valid email" }) }
        if (!validateString(phone)) { return res.status(400).send({ status: false, message: "please provide the phone number" }) }
        if (!regexNumber(phone)) { return res.status(400).send({ status: false, message: "please provide a valid phone number" }) }
        if (!validateString(password)) { return res.status(400).send({ status: false, message: "please provide the password" }) }
        if (!validatePassword(password)) { return res.status(400).send({ status: false, message: "Please provide a valid password" }) }
        if (!validateString(address)) { return res.status(400).send({ status: false, message: "please provide the address in body" }) }
        if (!validateString(address.shipping)) { return res.status(400).send({ status: false, message: "please provide the shipping details in address" }) }
        if (!validateString(address.shipping.street)) { return res.status(400).send({ status: false, message: "please provide the street in shipping address" }) }
        if (!validateString(address.shipping.city)) { return res.status(400).send({ status: false, message: "please provide the city in shipping address" }) }
        if (!address.shipping.pincode) { return res.status(400).send({ status: false, message: "please provide the pincode in shipping address" }) }
        if (!validateNumber(address.shipping.pincode)) { return res.status(400).send({ status: false, message: "please provide a valid shipping pincode" }) }
        if (address.shipping.pincode.toString().length !== 6) { return res.status(400).send({ status: false, message: "pincode must be 6 digits" }) }
        if (!validateString(address.billing)) { return res.status(400).send({ status: false, message: "please provide the billing details in address" }) }
        if (!validateString(address.billing.street)) { return res.status(400).send({ status: false, message: "please provide the street in billing address" }) }
        if (!validateString(address.billing.city)) { return res.status(400).send({ status: false, message: "please provide the city in billing address" }) }
        if (!address.billing.pincode) { return res.status(400).send({ status: false, message: "please provide the pincode in billing address" }) }
        if (!validateNumber(address.billing.pincode)) { return res.status(400).send({ status: false, message: "please provide a valid billing pincode" }) }
        if (address.billing.pincode.toString().length !== 6) { return res.status(400).send({ status: false, message: "pincode must be 6 digits" }) }

        const salt = await bcrypt.genSalt(13);
        const encryptedPassword = await bcrypt.hash(password, salt);
        data.password = encryptedPassword

        let profile = req.files;
        if (profile && profile.length > 0) {
            if(!imageExtValidator(profile[0].originalname)){return  res.status(400).send({status:false, message: "only image file is allowed" })}
            let uploadedFileURL = await uploadFile(profile[0]);
            data.profileImage = uploadedFileURL
        } else {
            return res.status(400).send({ status: false, message: "please provide profile image " });
        }

        let isDuplicateEmail = await userModel.findOne({ email: bodyData.email })
        if (isDuplicateEmail) { return res.status(400).send({ status: false, message: "this email already exists" }) }

        let isDuplicatePhone = await userModel.findOne({ phone: bodyData.phone })
        if (isDuplicatePhone) { return res.status(400).send({ status: false, message: "this phone number already exists" }) }

        let createdData = await userModel.create(data)
        res.status(201).send({ status: true, message: "user registered successfully", data: createdData })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}



let userLogin = async function (req, res) {
    try {
        let email = req.body.email
        let password = req.body.password
        if (!validateString(email)) {
            return res.status(400).send({ status: false, message: "email is required" })
        }
        if (!validateString(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        }

        let user = await userModel.findOne({ email: email});
        if (!user)
            return res.status(400).send({
                status: false,
                message: "email is not correct",
            });
        const passwordDetails = await bcrypt.compare(password, user.password)
        if (!passwordDetails) {
            return res.status(400).send({ status: false, msg: "password is incorrect pls provide correct password" })
        }
        let token = jwt.sign(
            {
                userId: user._id.toString(),
                iat: new Date().getTime(),
                exp: new Date().setDate(new Date().getDate() + 1)
            },
            "functionup-radon"
        );

        res.status(200).send({ status: true, message: "Success", data: { userId: user._id, token: token } });
    }
    catch (err) {

        return res.status(500).send({ status: false, message: err.message })
    }
}

let getUser = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!mongoose.isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "please enter valid userId" }) }
        let getUserDoc = await userModel.findById(userId)
        if (!getUserDoc) { return res.status(404).send({ status: false, message: "No such user is available" }) }

        res.status(200).send({ status: true, message: "User profile details", data: getUserDoc })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
const Updateprofile = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!mongoose.isValidObjectId(userId)) {return res.status(400).send({ status: false, msg: "pleade provide valid id" })}
        let bodyData = JSON.parse(JSON.stringify(req.body))
    
        let { fname,lname,email,phone,password} = bodyData
        if (validateRequest(bodyData)) {return res.status(400).send({ status: false, msg: "body can not be blank" })}
    
        let userData = await userModel.findById(userId)
        if(!userData){return res.status(400).send({ status: false, msg: "No such user is available" })}
    
        if(bodyData.hasOwnProperty('fname')){
            if(!regxName(fname)){return res.status(400).send({ status: false, msg: "provide valid first name" })}
                         userData.fname = fname
        }
        
        if(bodyData.hasOwnProperty("lname")){
            if(!regxName(lname)){return res.status(400).send({ status: false, msg: "provide valid last name" })}
                        userData.lname = lname
        }

        if(bodyData.hasOwnProperty("email")){
            if(!validateEmail(email)){return res.status(400).send({ status: false, msg: "provide valid email" })}
            let uniqueEmail = await userModel.findOne({email:email})
            if(uniqueEmail){return res.status(400).send({ status: false, msg: "This email is already registered" })}
                           userData.email = email
        }

        if(bodyData.hasOwnProperty("phone")){
            if(!regexNumber(phone)){return res.status(400).send({ status: false, msg: "provide valid phone number" })}
            let uniquephone = await userModel.findOne({phone:phone})
            if(uniquephone){return res.status(400).send({ status: false, msg: "This phone number is already registered" })}
                       userData.phone=phone
        }
     
        let profile = req.files;  
        if (profile && profile.length > 0) {
            if(!imageExtValidator(profileimage[0].originalname)){return  res.status(400).send({status:false, message: "only image file is allowed" })}
            let uploadedFileURL = await uploadFile(profile[0]);
        userData.profileImage = uploadedFileURL
    }
        
        if(bodyData.hasOwnProperty("password")){
            if (password.length < 8 || password.length > 15) { return res.status(400).send({ status: false, message: "password must be between 8-15" }) }
            const salt = await bcrypt.genSalt(13);
            const encryptedPassword = await bcrypt.hash(password, salt);
          userData.password=encryptedPassword
        }

        if(bodyData.hasOwnProperty("address")){
           if(typeof bodyData.address == "string"){
         try{   bodyData.address=JSON.parse(bodyData.address)
         }catch(err){return res.status(400).send({status:false,maessage:"please provide valid pincode or type data correctly"})}
        }
          address= bodyData.address
           if(!address.hasOwnProperty("shipping") && !address.hasOwnProperty("billing")){ return res.status(400).send({ status: false, message: "please provide atleast Billing details or shipping details" }) }
          
           let {shipping,billing}=address
           if(address.hasOwnProperty("shipping")){
            if(!shipping.hasOwnProperty("street") && !shipping.hasOwnProperty("city") && !shipping.hasOwnProperty("pincode")){ return res.status(400).send({ status: false, message: "please provide street pincode city" }) }
                let {street,city,pincode}=shipping
                if(shipping.hasOwnProperty("street")){
                    if(typeof street!=="string" || !validateString(street)){return res.status(400).send({ status: false, message: "shipping:street field is empty or not a string" })}
                     userData.address.shipping.street = street
            }
                if(shipping.hasOwnProperty("city")){
                    if(typeof city!=="string" || !validateString(city)){return res.status(400).send({ status: false, message: "shippping address:city field is empty or not a string" }) }
                    userData.address.shipping.city = city
                }
                if(shipping.hasOwnProperty("pincode")){ 
                    if (!isValidPincode(pincode)) {return res.status(400).send({ status: false, message: "Shipping address: pin code should be valid like: 335659 " });}
                    userData.address.shipping.pincode = pincode
                }
           }
           if(address.hasOwnProperty("billing")){
            if(!shipping.hasOwnProperty("street") && !shipping.hasOwnProperty("city") && !shipping.hasOwnProperty("pincode")){ return res.status(400).send({ status: false, message: "please provide street pincode city" }) }

                let {street,city,pincode}=billing
                if(billing.hasOwnProperty("street")){
                    if(typeof street!=="string" || !validateString(street)){return res.status(400).send({ status: false, message: "billing address:street field is empty or not a string" }) }
                    userData.address.billing.street = street
                }
                if(billing.hasOwnProperty("city")){
                    if(typeof city!=="string" || !validateString(city)){return res.status(400).send({ status: false, message: "billing address:city field is empty or not a string" }) }
                    userData.address.billing.city = city
                }
                if(billing.hasOwnProperty("pincode")){
                    if (!isValidPincode(pincode)) {return res.status(400).send({ status: false, message: "billing address: pin code should be valid like: 335659 " })}
                    userData.address.billing.pincode = pincode
                }
          }
        }

           userData.save()
        res.status(200).send({ status: true, data: userData })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, error: err.message })
    }
}
module.exports = { createUser, userLogin, getUser, Updateprofile }
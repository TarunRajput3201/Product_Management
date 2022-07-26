const { findOne } = require("../models/userModel")
const userModel = require("../models/userModel")
const { validateString, validateNumber, validateRequest, validateEmail, regexNumber, regxName, isValidPincode, validatePassword } = require("../validator/validations")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const { uploadFile } = require("../controllers/awsController")
const jwt=require("jsonwebtoken")

let createUser = async function (req, res) {
    try {
        
        let bodyData = req.body
        
        let { fname,lname,email,phone,password,address } = bodyData
       
        
        

        let obj = {}
        if (validateRequest(bodyData)) { return res.status(400).send({ status: false, message: "please provide the bodyData in body" }) }
        // if (bodyData == undefined || bodyData == null) { return res.status(400).send({ status: false, message: "please provide the bodyData in body" }) }

        if (!validateString(fname)) { return res.status(400).send({ status: false, message: "please provide the first name" }) }
        if (!regxName(fname)) { return res.status(400).send({ status: false, message: "please provide a valid first name" }) }
        obj.fname = fname

        if (!validateString(lname)) { return res.status(400).send({ status: false, message: "please provide the last name" }) }
        if (!regxName(lname)) { return res.status(400).send({ status: false, message: "please provide a valid last name" }) }
        obj.lname = lname

        if (!validateString(email)) { return res.status(400).send({ status: false, message: "please provide the email" }) }
        if (!validateEmail(email)) { return res.status(400).send({ status: false, message: "please provide a valid email" }) }
        let isDuplicateEmail = await userModel.findOne({ email: email })
        if (isDuplicateEmail) { return res.status(400).send({ status: false, message: "this email already exists" }) }
        obj.email = email
        console.log(bodyData.profileImage)
        // if (!validateString(bodyData.profileImage)) { return res.status(400).send({ status: false, message: "please provide the profileImage" }) }
        let profile = req.files;

        if (profile && profile.length > 0) {
            let uploadedFileURL = await uploadFile(profile[0]);
            obj.profileImage = uploadedFileURL

        } else {
            return res.status(400).send({ status: false, message: "please provide profile image " });
        }


        if (!validateString(phone)) { return res.status(400).send({ status: false, message: "please provide the phone number" }) }
        if (!regexNumber(phone)) { return res.status(400).send({ status: false, message: "please provide a valid phone number" }) }
        let isDuplicatePhone = await userModel.findOne({ phone: phone })
        if (isDuplicatePhone) { return res.status(400).send({ status: false, message: "this phone number already exists" }) }
        obj.phone = phone

        if (!validateString(password)) { return res.status(400).send({ status: false, message: "please provide the password" }) }
        if (password.length < 8 || password.length > 15) { return res.status(400).send({ status: false, message: "password must be between 8-15" }) }
        const salt = await bcrypt.genSalt(13);
        const encryptedPassword = await bcrypt.hash(password, salt);
        obj.password = encryptedPassword


       
        if (validateRequest(address)) {
            return res.status(400).send({ status: false, message: "please provide address" });
        }
        address = JSON.parse(address)
        const { shipping, billing } = address;
         console.log(billing)
        if (validateRequest(shipping)) {
            return res.status(400).send({ status: false, message: "Shipping address is required" });
        } else {
            let { street, city, pincode } = shipping;

            if (!validateString(street)) {
                return res.status(400).send({ status: false, message: "Shipping address: street name is required " });
            }
             
            if(!pincode){
                return res.status(400).send({ status: false, message: "Shipping address: please provide pin code" });
            }
            if (!isValidPincode(pincode)) {
                return res.status(400).send({ status: false, message: "Shipping address: pin code should be valid like: 335659 " });
            }

            if (!validateString(city)) {
                return res.status(400).send({ status: false, message: "Shipping address: city name is required " });
            }
        }

        if (validateRequest(billing)) {
            return res.status(400).send({ status: false, message: "Billing address is required" });
        }
        else {
            let { street, city, pincode } = billing;
               
            if (!validateString(street)) {
                return res.status(400).send({ status: false, message: "Billing address: street name is required " });
            }
            
            if(!pincode){
                return res.status(400).send({ status: false, message: "Billling address: please provide pin code" });
            }
            if (!isValidPincode(pincode)) {
                return res.status(400).send({ status: false, message: "Billing address: pin code should be valid like: 335659 " });
            }

            if (!validateString(city)) {
                return res.status(400).send({ status: false, message: "Shipping address: city name is required ", });
            }

        }
        obj.address = address

        let data = await userModel.create(obj)
        res.status(201).send({ status: true, message: "user registered successfully", data: data })
    }
    catch (err) {

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
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "pleade provide valid id" });
        }
        let bodyData = req.body
        let { fname,lname,email,phone,password,address } = bodyData
        console.log(bodyData)
        if (validateRequest(bodyData)) {
            return res.status(400).send({ status: false, msg: "body can not be blank" });
        }
        console.log(bodyData.hasOwnProperty('fname'))
        if(bodyData.hasOwnProperty('fname')){
            if(!regxName(fname)){return res.status(400).send({ status: false, msg: "provide valid first name" })}
        }
        
        if(bodyData.hasOwnProperty("lname")){
            if(!regxName(lname)){return res.status(400).send({ status: false, msg: "provide valid last name" })}
        }

        if(bodyData.hasOwnProperty("email")){
            if(!validateEmail(email)){return res.status(400).send({ status: false, msg: "provide valid email" })}
        }

        if(bodyData.hasOwnProperty("phone")){
            if(!validateNumber(phone)){return res.status(400).send({ status: false, msg: "provide valid phone number" })}
        }
     
        
        

        let profile = req.files;
        if (validateString(bodyData.profileImage)) {
        if(profile[0].fieldname=='profileImage')  
        {
        if (profile && profile.length > 0) {
            let uploadedFileURL = await uploadFile(profile[0]);
        bodyData.profileImage = uploadedFileURL
    }
        }}



        if(bodyData.hasOwnProperty("password")){
            if (password.length < 8 || password.length > 15) { return res.status(400).send({ status: false, message: "password must be between 8-15" }) }
            const salt = await bcrypt.genSalt(13);
            const encryptedPassword = await bcrypt.hash(password, salt);
          bodyData.password=encryptedPassword
        
        }

        if(bodyData.hasOwnProperty("address")){

           if(validateRequest(address)){ return res.status(400).send({ status: false, message: "please provide address" }) }
           address=JSON.parse(address)
           let {shipping,billing}=address
           if(address.hasOwnProperty("shipping")){
            if(validateRequest(shipping)){ return res.status(400).send({ status: false, message: "please provide shipping" }) }
            else{ 
                let {street,city,pincode}=shipping
                if(shipping.hasOwnProperty("street")){if(typeof street!=="string" || !validateString(street)){
                    return res.status(400).send({ status: false, message: "shipping:street field is empty or not a string" }) 
                }}
                if(shipping.hasOwnProperty("city"))
                {if(typeof city!=="string" || !validateString(city)){
                    return res.status(400).send({ status: false, message: "shippping address:city field is empty or not a string" }) 
                }}
                if(shipping.hasOwnProperty("pincode")){  if (!isValidPincode(pincode)) {
                    return res.status(400).send({ status: false, message: "Shipping address: pin code should be valid like: 335659 " });
                }}
                }
           }
           if(address.hasOwnProperty("billing")){
             if(validateRequest(billing)){ return res.status(400).send({ status: false, message: "please provide shipping" }) }
            else{ 

                let {street,city,pincode}=billing
                if(billing.hasOwnProperty("street")){if(typeof street!=="string" || !validateString(street)){
                    return res.status(400).send({ status: false, message: "billing address:street field is empty or not a string" }) 
                }}
                if(billing.hasOwnProperty("city"))
                {if(typeof city!=="string" || !validateString(city)){
                    return res.status(400).send({ status: false, message: "billing address:city field is empty or not a string" }) 
                }}
                if(billing.hasOwnProperty("pincode")){  if (!isValidPincode(pincode)) {
                    return res.status(400).send({ status: false, message: "billing address: pin code should be valid like: 335659 " });
                }}
                }
           }
           

        }

        const userData = await userModel.findOneAndUpdate({ id: userId }, { $set: bodyData} )
        res.status(200).send({ status: true, data: userData })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}
module.exports = { createUser, userLogin, getUser, Updateprofile }
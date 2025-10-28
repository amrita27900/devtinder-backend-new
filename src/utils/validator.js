const validator = require('validator');

const validateSignupData =(req) =>{

    const { firstName, lastName, emailId, password} = req.body;


    if(!firstName || !lastName){
        throw new Error("name is not valid")
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("emailid is not valid")
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("please enter a strong password")
    }

}


const validateEditProfileData =(req) =>{
const allowedEditFields =[
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills"
]
 const isEditAllowed = Object.keys(req.body).every((field)=>{
  return  allowedEditFields.includes(field)
 })
 
 return isEditAllowed
}
module.exports ={
    validateSignupData,
    validateEditProfileData
}
const express  = require("express");
const profileRouter = express.Router();
const {userAuth} = require('../middleware/Auth.js')
const { validateEditProfileData} = require('../utils/validator.js')

profileRouter.get("/profile/view",userAuth,async(req,res)=>{

    try {
    let user = req.user
    if(!user){
        throw new Error("user does not exist")
    }
    console.log("hiii")
    res.send(user)
    } catch (error) {
        res.status(500).send("Error:" +error.message)
    }
    
})

profileRouter.patch("/profile/edit", userAuth, async(req,res)=>{
try {
   if(!validateEditProfileData(req)){
     throw new Error("invalid edit request")
    }
   const loggedInUser = req.user;
   Object.keys(req.body).forEach((key)=>loggedInUser[key] = req.body[key])
   await loggedInUser.save();
res.json({
    message:`${loggedInUser.firstName}, your profile updated successfully`,
    data :loggedInUser
})

} catch (error) {
    res.status(400).send("ERROR:" +error.message)
}
})


module.exports = profileRouter
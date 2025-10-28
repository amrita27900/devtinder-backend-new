const express = require("express");
const authRouter  = express.Router();
const User = require("../models/user.js");
const bcrypt = require('bcrypt')
const cookie = require("cookie");
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { validateSignupData} = require('../utils/validator.js')
const {userAuth} = require('../middleware/Auth.js')


authRouter.post("/signup", async (req, res) => {
  try {

    validateSignupData(req)
    const {firstName, lastName, emailId,password } = req.body;
    const passwordhash = await bcrypt.hash(password, 10)

    const user = new User({
        firstName,
        lastName,
        emailId,
        password:passwordhash
    });
    
    
    await user.save();
    res.status(201).send("User created successfully ✅");
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Server error ❌");
  }
});

authRouter.post('/login', async(req,res)=>{
    try {
        const {emailId, password} = req.body;
        const user = await User.findOne({emailId});
        if(!user){
            throw new Error ("emailid is not valid")
        }
        console.log(emailId, password)
        const isPAsswordValid = await user.verifyPassword(password)
        console.log("isPAsswordValid",isPAsswordValid)

        if(isPAsswordValid){

            const token = await user.getJWT()
            console.log(token)
            res.cookie("token",token)
            res.send(user)
        }else{
            throw new Error("password id is not correct")
        }
    } catch (error) {
        res.status(400).send("Error : "  +error.message)
    }
})

authRouter.post('/logout', (req,res)=>{
    res.cookie("token", null ,{expires: new Date(Date.now())});
    res.send("logout successfully")
})


module.exports =  authRouter
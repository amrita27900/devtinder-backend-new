const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt')
const cookie = require("cookie");
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const userSchema = mongoose.Schema({
    firstName :{
        type:String, 
        required:true
    },
    lastName:{
        type:String
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("invalid email")
            }
        }
    },

    password:{
        type:String 
    },
    age:{
        type:Number
    },
    gender:{
        type:String,
        validate(value){
            if(!["male","female","other"].includes(value)){
                throw new error("gender data is not valid");
                
            }
        }
    },
    photoUrl:{
        type:String
    },
    about:{
        type:String,
        default:"sdfghj"
    },
    skills:{
        type:[String]
    }
});

userSchema.methods.getJWT = async function(){
    const user = this
   const token =jwt.sign({_id:user._id},"asdfghjkl");
   return token
}

userSchema.methods.verifyPassword = async function(PAsswordbyinputuser){
    const user = this;
    const hashmapPassword = user.password
    const isPAsswordValid = await bcrypt.compare(PAsswordbyinputuser, hashmapPassword);
    return isPAsswordValid
}
const User = mongoose.model("User", userSchema);
module.exports = User;
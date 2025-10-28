const jwt = require('jsonwebtoken');
const User = require('../models/user');


const userAuth =async(req, res, next) =>{
    try {

        const {token} = req.cookies;
        const decoded = jwt.verify(token ,"asdfghjkl");
        const {_id} = decoded;
        const user = await User.findById(_id);
        if(!user){
            res.status(401).send("please login ")
        }
        req.user =user;
        next()
    } catch (error) {
       
       res.status(500).send( "Error" +error.message)
    }

}

module.exports ={
    userAuth
}
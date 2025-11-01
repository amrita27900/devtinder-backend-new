const express = require("express");
const app = express();
const User = require("./models/user.js");
const connectDb = require("./config/database.js");
const { validateSignupData} = require('./utils/validator.js')
const {userAuth} = require('./middleware/Auth.js')
const bcrypt = require('bcrypt')
const cookie = require("cookie");
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const authRouter = require('./routes/auth.js');
const profileRouter = require('./routes/profile.js');
const requestRouter = require('./routes/request.js');
const userRouter = require("./routes/user.js");
const fileRouter = require("./routes/fileRoutes.js");
const cors = require('cors');
const path = require("path");


// Connect to MongoDB
connectDb();

// Middleware to parse JSON
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: ["http://localhost:5173", "https://devaadi.co.in", "http://devaadi.co.in"],
    credentials: true
}));
// Test route
app.use('/',authRouter);
app.use('/',profileRouter);
app.use('/',requestRouter);
app.use('/', userRouter);
//app.use("/", fileRouter);

app.get("/user", async(req,res)=>{
try {
    console.log("req",req.body)
    const emailId = req.body.emailId
    console.log(emailId,"userId")
    const users = await User.find({emailId});
    console.log("hiii",users)
    if(users.length !== 0){
        res.status(200).send(users)
    }
    else{
        res.send("no user found")
    }
} catch (error) {
    res.status(404).send("something went wrong")
}
} )


app.get('/feed', async(req, res)=>{
 try {
    const users = await User.find({});
    res.status(200).send(users)
    
 } catch (error) {
    res.status(500).send("somethinf went wrong")
 }

})
app.delete('/user', async(req,res)=>{
 const userId = req.body.userId;
 console.log("userId")
 const user = await User.findByIdAndDelete(userId);
 console.log("user", user)
 res.send("user deleted successfully");
})


app.patch("/user/:userId", async(req,res)=>{
    const userId = req.params?.userId;
    const data = req.body;
    console.log(userId,data)
    try{
       const  isAllowed =[ "about","age", "gender", "photoUrl"];
       const isUpdateAllowecd = Object.keys(data).every((k)=>isAllowed.includes(k));
       if(!isUpdateAllowecd){
        throw new Error("update not allowed")
       }
       
        const user = await User.findByIdAndUpdate(userId,data,{ runValidators: true })
        
        res.send("user updated successfully")
    }
    catch(err){
        res.status(500).send("something went wrong")
    }
})

app.use(express.static(path.join(__dirname, "client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist", "index.html"));
});

app.listen(4000, '0.0.0.0',() => {
  console.log("✅ Server is running on http://localhost:4000");
});

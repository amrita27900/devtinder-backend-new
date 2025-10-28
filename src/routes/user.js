

const express = require('express');
const { userAuth } = require('../middleware/Auth');
const ConnectionRequest = require('../models/connectionRequest');
const userRouter = express.Router();
const User = require('../models/user')
const User_Safe_data ="firstName lastName photoUrl age gender about skills"

userRouter.get('/user/request/received', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    console.log("loggedInUser:", loggedInUser);

    // Await the query first
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested"
    }).populate("fromUserId", User_Safe_data);

    // Now filter out nulls safely
    const cleanRequests = connectionRequests
      .map(req => req.fromUserId)
      .filter(u => u !== null);

    res.json({
      message: "Data fetched successfully",
      data: cleanRequests
    });
  } catch (error) {
    console.error("Error fetching received requests:", error);
    res.status(500).json({ message: error.message });
  }
});


userRouter.get('/user/connections',userAuth, async(req, res)=>{
    try {
        const loggedInUser = req.user;
        const connnectionRequests = await ConnectionRequest.find({
            $or:[
                {
                    toUserId:loggedInUser._id,
                    status:"accepted"
                },
                {
                    fromUserId:loggedInUser._id,
                    status:"accepted"
                }
            ]
        }).populate("fromUserId",User_Safe_data)
        .populate("toUserId",User_Safe_data)

     const data =  connnectionRequests.map((row)=>{
        if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
            return row.toUserId
        }
         return (row)=>row.fromUserId
    }).filter((u) => u !== null); 
     res.json({data})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

userRouter.get('/feed',userAuth, async(req,res)=>{
    try {

        const page = parseInt(req.query.page)|| 1;
        let limit = parseInt(req.query.limit) ||10;
        limit = limit>50? 50:limit

        const skip =(page-1)*limit
        const loggedInUser = req.user;
        const connectionRequest =  await ConnectionRequest.find({
            $or:[
                {fromUserId:loggedInUser._id},{ toUserId:loggedInUser._id}
            ]
        }).select("fromUserId  toUserId")


        const hideUserFromFeed = new Set();
        connectionRequest.forEach((request)=>{
            hideUserFromFeed.add(request.fromUserId.toString());
            hideUserFromFeed.add(request.toUserId.toString())
        });

        const users = await User.find({
            $and:[
           { _id:{$nin: Array.from(hideUserFromFeed)}},
           {_id:{$ne:loggedInUser._id}}
            ]
        }).select(User_Safe_data).skip(skip).limit(limit)
      res.json({data:users})
    } catch (error) {
        res.status(500).send("Error" +error.message)
    }
})
module.exports = userRouter
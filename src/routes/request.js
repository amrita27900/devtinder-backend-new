const express = require("express");
const { userAuth } = require("../middleware/Auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");


const mongoose = require('mongoose');
const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: `Invalid status type: ${status}` });
    }

    if (fromUserId.toString() === toUserId.toString()) {
      return res.status(400).json({ message: "You cannot send a request to yourself" });
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    });

    if (existingConnectionRequest) {
      return res.status(400).json({ message: "Connection request already exists" });
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status
    });

    const data = await connectionRequest.save();
    res.status(201).json({
      message: "Connection request sent successfully",
      data
    });
  } catch (error) {
    console.error("Error sending request:", error);
    res.status(500).json({ error: error.message });
  }
});
requestRouter.post("/request/review/:status/:requestId", userAuth, async(req, res)=>{
    try{
        const loggedInUser = req.user; 
        const { status, requestId} = req.params;
        const  allowedStatus  =["accepted","rejected"];
        console.log("allowedStatus",allowedStatus)
        if(!allowedStatus.includes(status)){
            return res.status(400).json({message:"status not allwed"})
        }
     console.log("requestId",requestId);
     console.log("loggedInUser._id",loggedInUser._id);
     console.log("status",status)


    const connectionRequest = await ConnectionRequest.findOne({
        _id:requestId,
        toUserId:loggedInUser._id,
        status:"interested"
    })
    // const connectionRequest = await ConnectionRequest.findOne({
    //   _id: new mongoose.Types.ObjectId(requestId),
    //   toUserId: new mongoose.Types.ObjectId(loggedInUser._id),
    //   status: "interested"
    // });
    console.log("connectionRequest",connectionRequest)
    if(!connectionRequest){
        return res.status(404).json({message:"connectionRequest not found"})
    }
    connectionRequest.status = status;
     const data  = await connectionRequest.save();
     res.json({message:"connection request" +status, data })
    }
    catch(err){
     res.status(400).send("error" +err.message )
    }
})

module.exports = requestRouter;

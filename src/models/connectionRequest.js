const mongoose = require('mongoose');
const User = require('./user');


const connectionRequestSchema = mongoose.Schema({
 
    fromUserId :{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    toUserId :{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
         required:true
    },
    status:{
        type:String,
        enum:{
          values: ["ignored","interested","accepted","rejected"],
          message: `{value}  is incorrect type`
        },
        
    }
},{timestamps:true})
connectionRequestSchema.index({fromUserId:1,toUserId:1})

connectionRequestSchema.pre("save", function(next){
    const ConnectionRequest =this;
    if(ConnectionRequest.fromUserId.equals(ConnectionRequest.toUserId)){
        throw new Error("can not send request to yourself")
    };
    next();
})

const ConnectionRequest = new mongoose.model("ConnectionRequest",connectionRequestSchema)

module.exports = ConnectionRequest
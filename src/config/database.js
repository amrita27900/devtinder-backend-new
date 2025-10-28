const mongoose = require('mongoose');
const express = require("express");
const app  = express();

const connectDb = async () => {
  console.log("Trying to connect...");
  try {
await mongoose.connect(
  "mongodb+srv://trivediamrita2790_db_user:ofDq4LQWhVuhGagp@cluster0.wum3net.mongodb.net/devtinder?retryWrites=true&w=majority&appName=Cluster0"
);    console.log("✅ Database connection established successfully");


  } catch (err) {
    console.error("❌ Database connection error:", err.message);
  }
};



module.exports = connectDb;
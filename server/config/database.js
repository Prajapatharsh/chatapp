const mongoose = require("mongoose");

require("dotenv").config();

exports.dbConnect = async()=>{
    try{
        mongoose.connect(process.env.MONGODB_URL)
        .then(()=> console.log("MongoDB connected successfully"))
    }
    catch(err){
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}
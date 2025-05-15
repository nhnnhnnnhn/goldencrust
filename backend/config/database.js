const mongoose = require("mongoose");

module.exports.connect = async () => {
    const uri = process.env.MONGO_URL;

    console.log("Connecting to MongoDB with URI:", uri);

    await mongoose.connect(uri, {
        
    });

    console.log("MongoDB connected successfully!");
};
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/restaurantDB";
        await mongoose.connect(mongoURI);
        console.log("MongoDB Connected Successfully");
    } catch (e) {
        console.log("MongoDB Connection Error:", e.message);
        process.exit(1);
    }
};

module.exports = connectDB;

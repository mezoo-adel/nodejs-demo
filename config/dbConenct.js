const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.DB_CREDITS);
    console.log("MongoDB connection: ", connection.connection.host);
  } catch (error) {
    console.error("MongoDB connection error", error);
  }
};

module.exports = connectDB;

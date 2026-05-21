import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGO_MODE === "cloud"
        ? process.env.CLOUD_URI
        : process.env.LOCAL_URI;

    const conn = await mongoose.connect(uri);

    console.log(
      `MongoDB connected to ${
        process.env.MONGO_MODE === "cloud" ? "Atlas (cloud)" : "Local Database"
      } : ${conn.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;

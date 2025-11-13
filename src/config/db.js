// backend/src/config/db.js
import mongoose from "mongoose";
import logger from "../utils/logger.js";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sjdportal";
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const host = mongoose.connection.host;
    logger.info(`MongoDB connected: ${host}`);
    console.log(`🟢 MongoDB connected: ${host}`);
  } catch (err) {
    logger.error("MongoDB connection error", { error: err.message });
    throw err;
  }
};

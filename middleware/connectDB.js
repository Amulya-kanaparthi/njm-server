import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
export const connectMongoDB = async () => {
  const mongoUrl = process.env.MONGO_URL;
  console.log("🧩 MONGO_URL from env:", mongoUrl); // debug log

  if (!mongoUrl) throw new Error("❌ MONGO_URL is missing in environment");

  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
};







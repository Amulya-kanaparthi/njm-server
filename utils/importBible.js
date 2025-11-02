// import dotenv from "dotenv";
import fs from "fs";
// import path from "path";
import { connectMongoDB } from "../middleware/connectDB.js";
import Bible from '../models/bibleModel.js';
// dotenv.config({ path: path.resolve("..", ".env") });


async function importBibleData() {
  try {
    await connectMongoDB();

    console.log("✅ Connected to MongoDB");

    // Load JSON file (update path and language)
    const data = JSON.parse(
      fs.readFileSync("./bible_data/english_bible.json", "utf8")
    );

    const language = "english"; // or "telugu"

    const documents = [];

    for (const [book, chapters] of Object.entries(data)) {
      for (const [chapter, verses] of Object.entries(chapters)) {
        documents.push({
          language,
          book,
          chapter: Number(chapter),
          verses,
        });
      }
    }

    console.log(`📖 Preparing to insert ${documents.length} chapters...`);

    // Clear old data if you reimport
    await Bible.deleteMany({ language });
    console.log(`🧹 Cleared existing ${language} Bible data`);

    await Bible.insertMany(documents);
    console.log(`✅ ${language} Bible data imported successfully!`);
  } catch (error) {
    console.error("❌ Error importing Bible data:", error);
  } finally {
    process.exit();
  }
}

importBibleData();

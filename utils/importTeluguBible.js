import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { connectMongoDB } from "../middleware/connectDB.js";
import Bible from "../models/bibleModel.js";

dotenv.config();

async function importTeluguBible() {
  try {
    await connectMongoDB();
    console.log("✅ Connected to MongoDB");

    const basePath = "./bible_data/telugu_bible";
    const booksFile = path.join(basePath, "books.json");

    if (!fs.existsSync(booksFile)) {
      throw new Error("books.json not found");
    }

    // Read all book mappings
    const booksData = JSON.parse(fs.readFileSync(booksFile, "utf8"));
    const language = "telugu";
    const documents = [];

    // Loop through each entry in books.json
    for (const entry of booksData) {
      const englishName = entry.book.english;
      const teluguName = entry.book.telugu;

      const bookFile = path.join(basePath, `${englishName}.json`);
      if (!fs.existsSync(bookFile)) {
        console.warn(`⚠️ File not found for ${englishName}`);
        continue;
      }

      const bookData = JSON.parse(fs.readFileSync(bookFile, "utf8"));
      const chapters = bookData.chapters || [];

      for (const ch of chapters) {
        const chapterNum = Number(ch.chapter);
        const versesArray = ch.verses;

        // Convert verses array to { "1": "text", "2": "text" }
        const verses = {};
        for (const v of versesArray) {
          verses[v.verse] = v.text;
        }

        documents.push({
          language,
          book: teluguName,
          englishBook: englishName, // Optional: helps cross-reference
          chapter: chapterNum,
          verses,
        });
      }

      console.log(`Processed ${englishName} (${chapters.length} chapters)`);
    }

    console.log(`Prepared ${documents.length} chapters. Deleting old data...`);
    await Bible.deleteMany({ language });
    console.log("🧹 Old Telugu Bible data cleared.");

    await Bible.insertMany(documents);
    console.log(`Telugu Bible imported successfully with ${documents.length} chapters.`);
  } catch (error) {
    console.error("❌ Error importing Telugu Bible:", error);
  } finally {
    process.exit();
  }
}

importTeluguBible();

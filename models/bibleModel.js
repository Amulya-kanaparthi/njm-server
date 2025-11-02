import mongoose from "mongoose";

const bibleSchema = new mongoose.Schema({
  language: { type: String, required: true },
  book: { type: String, required: true },
  chapter: { type: Number, required: true },
  verses: { type: Map, of: String, required: true },
});

export default mongoose.model("Bible", bibleSchema);

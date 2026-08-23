import mongoose, { Schema, Model } from "mongoose";
import type { IChapter } from "@/types";

const ChapterSchema = new Schema<IChapter>({
  bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  chapterNumber: { type: Number, required: true },
  title: { type: String, default: "" },
  contentHTML: { type: String, required: true },
});

ChapterSchema.index({ bookId: 1, chapterNumber: 1 }, { unique: true });

const Chapter: Model<IChapter> =
  mongoose.models.Chapter || mongoose.model<IChapter>("Chapter", ChapterSchema);

export default Chapter;

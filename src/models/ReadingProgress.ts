import mongoose, { Schema, Model } from "mongoose";
import type { IReadingProgress } from "@/types";

const ReadingProgressSchema = new Schema<IReadingProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    chapter: { type: Number, default: 1 },
    scrollPosition: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    lastReadAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ReadingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

const ReadingProgress: Model<IReadingProgress> =
  mongoose.models.ReadingProgress ||
  mongoose.model<IReadingProgress>("ReadingProgress", ReadingProgressSchema);

export default ReadingProgress;

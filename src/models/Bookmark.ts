import mongoose, { Schema, Model } from "mongoose";
import type { IBookmark } from "@/types";

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    chapterNumber: { type: Number, required: true },
    scrollPosition: { type: Number, required: true },
    label: { type: String, default: "" },
  },
  { timestamps: true }
);

BookmarkSchema.index({ userId: 1, bookId: 1 });

const Bookmark: Model<IBookmark> =
  mongoose.models.Bookmark ||
  mongoose.model<IBookmark>("Bookmark", BookmarkSchema);

export default Bookmark;

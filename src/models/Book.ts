import mongoose, { Schema, Model } from "mongoose";
import type { IBook } from "@/types";

const BookSchema = new Schema<IBook>(
  {
    gutenbergId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    language: { type: String, default: "en" },
    categories: [{ type: String }],
    chapterCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "ready", "failed"],
      default: "pending",
    },
    coverImageUrl: { type: String, default: "" },
    rawContent: { type: String, default: "" },
  },
  { timestamps: true }
);

const Book: Model<IBook> = mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);

export default Book;

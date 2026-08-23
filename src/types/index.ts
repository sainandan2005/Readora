import type { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  bookshelf: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IBook {
  _id: Types.ObjectId;
  gutenbergId: number;
  title: string;
  author: string;
  slug: string;
  language: string;
  categories: string[];
  chapterCount: number;
  status: "pending" | "processing" | "ready" | "failed";
  coverImageUrl: string;
  rawContent: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChapter {
  _id: Types.ObjectId;
  bookId: Types.ObjectId;
  chapterNumber: number;
  title: string;
  contentHTML: string;
}

export interface IReadingProgress {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  chapter: number;
  scrollPosition: number;
  percentage: number;
  lastReadAt: Date;
  updatedAt: Date;
}

export interface IBookmark {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  chapterNumber: number;
  scrollPosition: number;
  label: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IImportJob {
  _id: Types.ObjectId;
  gutenbergIds: number[];
  processedIds: number[];
  status: "pending" | "processing" | "completed" | "failed";
  processedCount: number;
  totalCount: number;
  errors: { gutenbergId: number; message: string }[];
  createdAt: Date;
  updatedAt: Date;
}

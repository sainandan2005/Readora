import mongoose, { Schema, Model } from "mongoose";
import type { IImportJob } from "@/types";

const ImportJobSchema = new Schema<IImportJob>(
  {
    gutenbergIds: [{ type: Number, required: true }],
    processedIds: [{ type: Number }],
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    processedCount: { type: Number, default: 0 },
    totalCount: { type: Number, required: true },
    errors: [
      {
        gutenbergId: { type: Number },
        message: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const ImportJob: Model<IImportJob> =
  mongoose.models.ImportJob || mongoose.model<IImportJob>("ImportJob", ImportJobSchema);

export default ImportJob;

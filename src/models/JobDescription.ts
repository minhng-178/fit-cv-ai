import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IJobDescription extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  companyName?: string;
  roleName?: string;
  rawText: string;
  extractedKeywords?: string[];
  createdAt: Date;
}

const JobDescriptionSchema = new Schema<IJobDescription>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  companyName: { type: String },
  roleName: { type: String },
  rawText: { type: String, required: true },
  extractedKeywords: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export const JobDescription = models.JobDescription || model<IJobDescription>('JobDescription', JobDescriptionSchema);

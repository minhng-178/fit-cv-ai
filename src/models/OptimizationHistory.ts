import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IOptimizationHistory extends Document {
  resumeVersionId: mongoose.Types.ObjectId;
  jobDescriptionId: mongoose.Types.ObjectId;
  suggestions: any;
  applied: boolean;
  createdAt: Date;
}

const OptimizationHistorySchema = new Schema<IOptimizationHistory>({
  resumeVersionId: { type: Schema.Types.ObjectId, ref: 'ResumeVersion', required: true },
  jobDescriptionId: { type: Schema.Types.ObjectId, ref: 'JobDescription', required: true },
  suggestions: { type: Schema.Types.Mixed, required: true },
  applied: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const OptimizationHistory = models.OptimizationHistory || model<IOptimizationHistory>('OptimizationHistory', OptimizationHistorySchema);

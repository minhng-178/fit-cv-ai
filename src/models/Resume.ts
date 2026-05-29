import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  activeVersionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, default: 'Untitled CV' },
  activeVersionId: { type: Schema.Types.ObjectId, ref: 'ResumeVersion' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Resume = models.Resume || model<IResume>('Resume', ResumeSchema);

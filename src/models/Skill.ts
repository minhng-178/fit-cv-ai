import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category?: string; // optional grouping hint (e.g. 'Frontend', 'Backend', 'DevOps')
  usageCount: number; // track popularity for sorting suggestions
  createdAt: Date;
}

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true, unique: true, trim: true },
  category: { type: String, trim: true },
  usageCount: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

// Text index for fast search
SkillSchema.index({ name: 'text' });

export const Skill = models.Skill || model<ISkill>('Skill', SkillSchema);

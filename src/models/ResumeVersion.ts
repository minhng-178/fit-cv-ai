import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IResumeVersion extends Document {
  resumeId: mongoose.Types.ObjectId;
  versionNumber: number;
  tags?: {
    role?: string;
    company?: string;
    jdId?: mongoose.Types.ObjectId;
  };
  content: {
    personalInfo?: {
      fullName?: string;
      title?: string;
      email?: string;
      phone?: string;
      website?: string;
      github?: string;
      linkedin?: string;
      location?: string;
      summary?: string;
    };
    workExperience?: Array<{
      id: string;
      company?: string;
      position?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      description?: string[];
    }>;
    education?: Array<{
      id: string;
      school?: string;
      degree?: string;
      fieldOfStudy?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    }>;
    skills?: Array<{
      id: string;
      category?: string;
      items?: string[];
    }>;
    projects?: Array<{
      id: string;
      name?: string;
      role?: string;
      description?: string;
      technologies?: string[];
      url?: string;
    }>;
    languages?: Array<{
      id: string;
      language?: string;
      proficiency?: string;
    }>;
    certifications?: Array<{
      id: string;
      name?: string;
      issuer?: string;
      date?: string;
    }>;
    layout?: {
      template?: string;
      themeColor?: string;
      fontFamily?: string;
      fontSize?: string;
    };
  };
  createdAt: Date;
}

const ResumeVersionSchema = new Schema<IResumeVersion>({
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
  versionNumber: { type: Number, required: true },
  tags: {
    role: { type: String },
    company: { type: String },
    jdId: { type: Schema.Types.ObjectId, ref: 'JobDescription' },
  },
  content: {
    personalInfo: {
      fullName: { type: String },
      title: { type: String },
      email: { type: String },
      phone: { type: String },
      website: { type: String },
      github: { type: String },
      linkedin: { type: String },
      location: { type: String },
      summary: { type: String },
    },
    workExperience: [{
      id: { type: String, required: true },
      company: { type: String },
      position: { type: String },
      location: { type: String },
      startDate: { type: String },
      endDate: { type: String },
      current: { type: Boolean },
      description: [{ type: String }],
    }],
    education: [{
      id: { type: String, required: true },
      school: { type: String },
      degree: { type: String },
      fieldOfStudy: { type: String },
      location: { type: String },
      startDate: { type: String },
      endDate: { type: String },
      description: { type: String },
    }],
    skills: [{
      id: { type: String, required: true },
      category: { type: String },
      items: [{ type: String }],
    }],
    projects: [{
      id: { type: String, required: true },
      name: { type: String },
      role: { type: String },
      description: { type: String },
      technologies: [{ type: String }],
      url: { type: String },
    }],
    languages: [{
      id: { type: String, required: true },
      language: { type: String },
      proficiency: { type: String },
    }],
    certifications: [{
      id: { type: String, required: true },
      name: { type: String },
      issuer: { type: String },
      date: { type: String },
    }],
    layout: {
      template: { type: String, default: 'two-columns-left' },
      themeColor: { type: String, default: 'emerald' },
      fontFamily: { type: String, default: 'sans' },
      fontSize: { type: String, default: 'md' },
    },
  },
  createdAt: { type: Date, default: Date.now },
});

export const ResumeVersion = models.ResumeVersion || model<IResumeVersion>('ResumeVersion', ResumeVersionSchema);

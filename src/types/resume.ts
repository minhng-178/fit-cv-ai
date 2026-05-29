export interface PersonalInfo {
  fullName?: string;
  title?: string;
  email?: string;
  phone?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  location?: string;
  summary?: string;
}

export interface WorkExperience {
  id: string;
  company?: string;
  position?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string[];
}

export interface Education {
  id: string;
  school?: string;
  degree?: string;
  fieldOfStudy?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface SkillCategory {
  id: string;
  category?: string;
  items?: string[];
}

export interface Project {
  id: string;
  name?: string;
  role?: string;
  description?: string;
  technologies?: string[];
  url?: string;
}

export interface Language {
  id: string;
  language?: string;
  proficiency?: string;
}

export interface Certification {
  id: string;
  name?: string;
  issuer?: string;
  date?: string;
}

export interface LayoutConfig {
  template?: 'two-columns-left' | 'two-columns-right' | 'single-column';
  themeColor?: 'emerald' | 'blue' | 'indigo' | 'rose' | 'slate';
  fontFamily?: 'sans' | 'serif' | 'display';
  fontSize?: 'sm' | 'md' | 'lg';
}

export interface ResumeData {
  personalInfo?: PersonalInfo;
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: SkillCategory[];
  projects?: Project[];
  languages?: Language[];
  certifications?: Certification[];
  layout?: LayoutConfig;
}

export interface AiSuggestionAddition {
  section: string;
  content: string;
  reasoning: string;
}

export interface AiSuggestionRewrite {
  path: string;
  itemId: string;
  originalText: string;
  suggestedText: string;
  reasoning: string;
}

export interface AiSuggestions {
  overallScore: number;
  analysisSummary: string;
  missingKeywords: string[];
  suggestedAdditions: AiSuggestionAddition[];
  suggestedRewrites: AiSuggestionRewrite[];
}

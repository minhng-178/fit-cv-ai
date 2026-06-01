import { create } from 'zustand';
import { produce } from 'immer';
import { set as lodashSet } from 'lodash';
import apiClient from '@/lib/api-client';
import {
  ResumeData,
  AiSuggestions,
  AiSuggestionRewrite,
} from '@/types';
import { validateResumeData } from '@/lib/validation';


interface ResumeState {
  // Data State
  resumeId: string | null;
  versionId: string | null;
  versionNumber: number;
  resumeData: ResumeData;

  // UI State
  activeSection: string;
  zoomRatio: number;
  isLoading: boolean;
  isSaving: boolean;
  isOptimizing: boolean;
  aiSuggestions: AiSuggestions | null;
  activeSuggestionsApplied: Record<string, boolean>; // track applied suggestions to toggle UI checkmarks
  language: 'vi' | 'en';

  // Actions
  fetchResume: (resumeId?: string) => Promise<void>;
  saveResume: () => Promise<boolean>;
  importResumeData: (data: ResumeData) => Promise<boolean>;
  updateField: (path: string, value: any) => void;
  setActiveSection: (section: string) => void;
  setZoomRatio: (ratio: number | ((prev: number) => number)) => void;
  setLanguage: (lang: 'vi' | 'en') => void;

  // Array Manipulation Helpers
  addWorkExperience: () => void;
  removeWorkExperience: (id: string) => void;
  addEducation: () => void;
  removeEducation: (id: string) => void;
  addSkillCategory: () => void;
  removeSkillCategory: (id: string) => void;
  addProject: () => void;
  removeProject: (id: string) => void;
  addLanguage: () => void;
  removeLanguage: (id: string) => void;
  addCertification: () => void;
  removeCertification: (id: string) => void;

  // Resume title
  resumeTitle: string;
  setResumeTitle: (title: string) => void;
  
  // Validation State & Actions
  validationErrors: Record<string, string>;
  validateResume: () => boolean;

  // AI Actions
  runAiOptimization: (jdText: string, company: string, role: string) => Promise<void>;
  applyAiSuggestion: (rewrite: AiSuggestionRewrite, index: number) => void;
  resetSuggestions: () => void;
}

export const DEFAULT_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    website: '',
    github: '',
    linkedin: '',
    location: '',
    summary: '',
  },
  workExperience: [],
  education: [],
  skills: [],
  projects: [],
  languages: [],
  certifications: [],
  layout: {
    template: 'two-columns-left',
    themeColor: 'emerald',
    fontFamily: 'sans',
    fontSize: 'md',
  },
};

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useResumeStore = create<ResumeState>((set, get) => ({
  // Initial States
  resumeId: null,
  resumeTitle: '',
  versionId: null,
  versionNumber: 1,
  resumeData: DEFAULT_RESUME_DATA,
  activeSection: 'personalInfo',
  zoomRatio: 0.8,
  isLoading: false,
  isSaving: false,
  isOptimizing: false,
  aiSuggestions: null,
  activeSuggestionsApplied: {},
  validationErrors: {},
  language: typeof window !== 'undefined' ? (localStorage.getItem('fitcv_lang') as 'vi' | 'en') || 'vi' : 'vi',

  setActiveSection: (section) => set({ activeSection: section }),

  setResumeTitle: (title) => set({ resumeTitle: title }),

  setZoomRatio: (ratio) => set((state) => ({
    zoomRatio: typeof ratio === 'function' ? ratio(state.zoomRatio) : ratio
  })),

  setLanguage: (lang) => {
    set({ language: lang });
    if (typeof window !== 'undefined') {
      localStorage.setItem('fitcv_lang', lang);
    }
  },

  // Fetch from Mongoose via API
  fetchResume: async (resumeId?: string) => {
    set({ isLoading: true });
    try {
      const url = resumeId ? `/api/resumes?id=${resumeId}` : '/api/resumes';
      const res = await apiClient.get(url);
      const data = res.data;

      if (!data.resume) {
        console.warn('Database is offline or no resume found. App is running in Demo/Offline mode.');
        set({
          resumeId: null,
          resumeTitle: '',
          versionId: null,
          versionNumber: 1,
          resumeData: DEFAULT_RESUME_DATA,
        });
        return;
      }

      set({
        resumeId: data.resume._id,
        resumeTitle: data.resume.title || '',
        versionId: data.activeVersion?._id || null,
        versionNumber: data.activeVersion?.versionNumber || 1,
        resumeData: data.activeVersion?.content || DEFAULT_RESUME_DATA,
      });
    } catch (e: any) {
      console.warn('Could not fetch resume from database, running in Demo/Offline mode. Detail:', e.message || e);
      set({
        resumeId: null,
        resumeTitle: '',
        versionId: null,
        versionNumber: 1,
        resumeData: DEFAULT_RESUME_DATA,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // Save changes to DB (Creates a new ResumeVersion)
  saveResume: async () => {
    const { resumeId, resumeData } = get();
    if (!resumeId) {
      console.warn('Cannot save resume: No resume ID (running in Demo/Offline mode)');
      return false;
    }

    set({ isSaving: true });
    try {
      const res = await apiClient.post('/api/resumes', {
        resumeId,
        content: resumeData,
      });
      const data = res.data;
      set({
        versionId: data.version._id,
        versionNumber: data.version.versionNumber,
      });
      return true;
    } catch (e) {
      console.error('Error saving CV in store:', e);
      return false;
    } finally {
      set({ isSaving: false });
    }
  },

  importResumeData: async (data) => {
    set(produce((state) => {
      const existingLayout = state.resumeData.layout;
      state.resumeData = {
        ...data,
        layout: data.layout || existingLayout || DEFAULT_RESUME_DATA.layout,
      };
    }));
    const success = await get().saveResume();
    return success;
  },

  // Update a single nested field (g.e., 'personalInfo.fullName')
  updateField: (path, value) => set(produce((state) => {
    lodashSet(state.resumeData, path, value);
    if (state.validationErrors && state.validationErrors[path]) {
      delete state.validationErrors[path];
    }
  })),

  validateResume: () => {
    const { resumeData } = get();
    const errors = validateResumeData(resumeData);
    set({ validationErrors: errors });
    return Object.keys(errors).length === 0;
  },

  // Array actions
  addWorkExperience: () => set(produce((state) => {
    if (!state.resumeData.workExperience) state.resumeData.workExperience = [];
    state.resumeData.workExperience.push({
      id: `exp-${generateId()}`,
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: [''],
    });
  })),

  removeWorkExperience: (id) => set(produce((state) => {
    state.resumeData.workExperience = state.resumeData.workExperience?.filter((x: any) => x.id !== id);
  })),

  addEducation: () => set(produce((state) => {
    if (!state.resumeData.education) state.resumeData.education = [];
    state.resumeData.education.push({
      id: `edu-${generateId()}`,
      school: '',
      degree: '',
      fieldOfStudy: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    });
  })),

  removeEducation: (id) => set(produce((state) => {
    state.resumeData.education = state.resumeData.education?.filter((x: any) => x.id !== id);
  })),

  addSkillCategory: () => set(produce((state) => {
    if (!state.resumeData.skills) state.resumeData.skills = [];
    state.resumeData.skills.push({
      id: `skill-${generateId()}`,
      category: '',
      items: [''],
    });
  })),

  removeSkillCategory: (id) => set(produce((state) => {
    state.resumeData.skills = state.resumeData.skills?.filter((x: any) => x.id !== id);
  })),

  addProject: () => set(produce((state) => {
    if (!state.resumeData.projects) state.resumeData.projects = [];
    state.resumeData.projects.push({
      id: `proj-${generateId()}`,
      name: '',
      role: '',
      description: '',
      technologies: [''],
      url: '',
    });
  })),

  removeProject: (id) => set(produce((state) => {
    state.resumeData.projects = state.resumeData.projects?.filter((x: any) => x.id !== id);
  })),

  addLanguage: () => set(produce((state) => {
    if (!state.resumeData.languages) state.resumeData.languages = [];
    state.resumeData.languages.push({
      id: `lang-${generateId()}`,
      language: '',
      proficiency: '',
    });
  })),

  removeLanguage: (id) => set(produce((state) => {
    state.resumeData.languages = state.resumeData.languages?.filter((x: any) => x.id !== id);
  })),

  addCertification: () => set(produce((state) => {
    if (!state.resumeData.certifications) state.resumeData.certifications = [];
    state.resumeData.certifications.push({
      id: `cert-${generateId()}`,
      name: '',
      issuer: '',
      date: '',
    });
  })),

  removeCertification: (id) => set(produce((state) => {
    state.resumeData.certifications = state.resumeData.certifications?.filter((x: any) => x.id !== id);
  })),

  // Call Gemini optimize endpoint
  runAiOptimization: async (jdText, company, role) => {
    const { versionId, language } = get();
    if (!versionId) return;

    set({ isOptimizing: true });
    try {
      const res = await apiClient.post('/api/optimize', {
        resumeVersionId: versionId,
        jdText,
        company,
        role,
        language,
      });
      const data = res.data;
      set({
        aiSuggestions: data.suggestions,
        activeSuggestionsApplied: {}, // reset tracking
      });
    } catch (e) {
      console.error('Error in Gemini optimization:', e);
    } finally {
      set({ isOptimizing: false });
    }
  },

  // Apply target suggestion text to specific JSON path
  applyAiSuggestion: (rewrite, index) => set(produce((state) => {
    const { path, itemId, suggestedText } = rewrite;
    const keys = path.split('.');
    const section = keys[0]; // e.g. 'workExperience'

    let applied = false;

    // Try finding by unique ID first (highly reliable for arrays)
    if (itemId && Array.isArray(state.resumeData[section])) {
      const list = state.resumeData[section];
      const item = list.find((x: any) => x.id === itemId);

      if (item) {
        if (keys.includes('description') && Array.isArray(item.description)) {
          // path: workExperience.0.description.1 -> last element is the index
          const bulletIdx = parseInt(keys[keys.length - 1]);
          if (!isNaN(bulletIdx) && bulletIdx < item.description.length) {
            item.description[bulletIdx] = suggestedText;
            applied = true;
          }
        } else if (keys.includes('summary')) {
          item.summary = suggestedText;
          applied = true;
        } else if (keys.includes('description') && typeof item.description === 'string') {
          item.description = suggestedText;
          applied = true;
        }
      }
    }

    // Fallback: update via direct path set
    if (!applied) {
      lodashSet(state.resumeData, path, suggestedText);
    }

    // Mark as applied
    state.activeSuggestionsApplied[`${path}-${index}`] = true;
  })),

  resetSuggestions: () => set({ aiSuggestions: null, activeSuggestionsApplied: {} }),
}));

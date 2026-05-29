import { create } from 'zustand';
import { produce } from 'immer';
import { set as lodashSet } from 'lodash';
import apiClient from '@/lib/api-client';
import {
  ResumeData,
  AiSuggestions,
  AiSuggestionRewrite,
} from '@/types/resume';

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

  // Actions
  fetchResume: () => Promise<void>;
  saveResume: () => Promise<boolean>;
  updateField: (path: string, value: any) => void;
  setActiveSection: (section: string) => void;
  setZoomRatio: (ratio: number | ((prev: number) => number)) => void;

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

  // AI Actions
  runAiOptimization: (jdText: string, company: string, role: string) => Promise<void>;
  applyAiSuggestion: (rewrite: AiSuggestionRewrite, index: number) => void;
  resetSuggestions: () => void;
}

export const DEFAULT_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: 'Nguyễn Văn A',
    title: 'Senior Frontend Engineer',
    email: 'nguyenvana@gmail.com',
    phone: '+84 901 234 567',
    website: 'https://nguyenvana.dev',
    github: 'github.com/nguyenvana',
    linkedin: 'linkedin.com/in/nguyenvana',
    location: 'Hồ Chí Minh, Việt Nam',
    summary: 'Kỹ sư Frontend với hơn 5 năm kinh nghiệm thiết kế và phát triển các ứng dụng web quy mô lớn sử dụng React/Next.js. Có thế mạnh về tối ưu hóa hiệu năng frontend, xây dựng hệ thống UI/UX tương tác mượt mà và phát triển kiến trúc Micro-Frontend.',
  },
  workExperience: [
    {
      id: 'exp-1',
      company: 'TechCorp JSC',
      position: 'Senior Frontend Engineer',
      location: 'Hồ Chí Minh, Việt Nam',
      startDate: '2022-03',
      endDate: 'Present',
      current: true,
      description: [
        'Trưởng nhóm frontend xây dựng nền tảng thương mại điện tử bằng Next.js, nâng tốc độ tải trang lên 40% và đạt điểm số Lighthouse SEO tối đa (99/100).',
        'Thiết kế và triển khai kiến trúc Micro-Frontend hỗ trợ 3 dự án nhánh chạy độc lập, tối ưu 50% tài nguyên server.',
        'Tích hợp và xây dựng thư viện UI dùng chung cho toàn công ty giúp rút ngắn 35% thời gian phát triển của các phòng ban.'
      ],
    },
    {
      id: 'exp-2',
      company: 'Innova Solutions',
      position: 'Frontend Developer',
      location: 'Hồ Chí Minh, Việt Nam',
      startDate: '2019-09',
      endDate: '2022-02',
      current: false,
      description: [
        'Phát triển và bảo trì hệ thống Dashboard phân tích dữ liệu thời gian thực sử dụng ReactJS, Redux Toolkit và TailwindCSS.',
        'Hợp tác chặt chẽ với đội ngũ UX/UI để chuyển hóa thiết kế Figma thành các component có khả năng tái sử dụng cao và responsive hoàn hảo.'
      ],
    }
  ],
  education: [
    {
      id: 'edu-1',
      school: 'Đại học Khoa học Tự nhiên',
      degree: 'Cử nhân Công nghệ Thông tin',
      fieldOfStudy: 'Khoa học Máy tính',
      location: 'Hồ Chí Minh, Việt Nam',
      startDate: '2015-09',
      endDate: '2019-06',
      description: 'Tốt nghiệp loại Giỏi. GPA: 3.6/4.0. Đề tài khóa luận nghiên cứu ứng dụng AI vào gợi ý lộ trình học tập.',
    }
  ],
  skills: [
    {
      id: 'skill-1',
      category: 'Ngôn ngữ lập trình',
      items: ['JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Python'],
    },
    {
      id: 'skill-2',
      category: 'Frameworks / Thư viện',
      items: ['React.js', 'Next.js (App Router)', 'Vue.js', 'TailwindCSS', 'Redux Toolkit', 'Node.js'],
    },
    {
      id: 'skill-3',
      category: 'Công cụ & Hệ điều hành',
      items: ['Git', 'Docker', 'Webpack', 'Vite', 'CI/CD (GitHub Actions)', 'Linux'],
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'FitCV.ai - AI Resume Optimizer',
      role: 'Lead Full-stack Developer',
      description: 'Ứng dụng tối ưu hóa CV theo Job Description dựa trên trí tuệ nhân tạo. Giúp ứng viên tự động căn chỉnh CV phù hợp với bộ lọc ATS tuyển dụng.',
      technologies: ['Next.js', 'TailwindCSS', 'Zustand', 'Mongoose', 'Gemini API'],
      url: 'https://github.com/nguyenvana/fit-cv-ai',
    }
  ],
  languages: [
    {
      id: 'lang-1',
      language: 'Tiếng Việt',
      proficiency: 'Bản xứ',
    },
    {
      id: 'lang-2',
      language: 'Tiếng Anh',
      proficiency: 'Thành thạo (IELTS 7.0)',
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      date: '2023-08',
    }
  ],
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

  setActiveSection: (section) => set({ activeSection: section }),

  setZoomRatio: (ratio) => set((state) => ({
    zoomRatio: typeof ratio === 'function' ? ratio(state.zoomRatio) : ratio
  })),

  // Fetch from Mongoose via API
  fetchResume: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/api/resumes');
      const data = res.data;

      if (!data.resume) {
        console.warn('Database is offline or no resume found. App is running in Demo/Offline mode.');
        set({
          resumeId: null,
          versionId: null,
          versionNumber: 1,
          resumeData: DEFAULT_RESUME_DATA,
        });
        return;
      }

      set({
        resumeId: data.resume._id,
        versionId: data.activeVersion._id,
        versionNumber: data.activeVersion.versionNumber,
        resumeData: data.activeVersion.content,
      });
    } catch (e: any) {
      console.warn('Could not fetch resume from database, running in Demo/Offline mode. Detail:', e.message || e);
      set({
        resumeId: null,
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

  // Update a single nested field (g.e., 'personalInfo.fullName')
  updateField: (path, value) => set(produce((state) => {
    lodashSet(state.resumeData, path, value);
  })),

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
    const { versionId } = get();
    if (!versionId) return;

    set({ isOptimizing: true });
    try {
      const res = await apiClient.post('/api/optimize', {
        resumeVersionId: versionId,
        jdText,
        company,
        role,
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

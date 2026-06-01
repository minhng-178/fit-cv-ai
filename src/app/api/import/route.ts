import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { ResumeDataSchema } from '@/lib/gemini/schemas';
import type {
  ResumeData,
  WorkExperience,
  Education,
  SkillCategory,
  Project,
  Language,
  Certification,
} from '@/types';

// Helper to generate unique IDs for resume elements to match Zustand store format
const generateId = (prefix: string) => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not defined in environment variables' }, { status: 500 });
    }
    const ai = new GoogleGenAI({ apiKey });
    const contentType = req.headers.get('content-type') || '';
    let parsedResumeData: Partial<ResumeData> | null = null;

    const systemInstruction = `Bạn là một hệ thống AI chuyên gia trích xuất dữ liệu CV chất lượng cao. 
Nhiệm vụ của bạn là phân tích thông tin đầu vào (có thể là file PDF CV hoặc một đoạn văn bản thô từ profile LinkedIn) và chuyển đổi thành cấu trúc JSON chuẩn hóa 100%.

YÊU CẦU TRÍCH XUẤT:
1. Thông tin cá nhân (personalInfo): Trích xuất chính xác họ tên, vị trí ứng tuyển, email, số điện thoại, mạng xã hội, tóm tắt tiểu sử.
2. Kinh nghiệm làm việc (workExperience): Trích xuất các vị trí công việc, công ty, thời gian (định dạng YYYY/MM), nhiệm vụ và kết quả (chia nhỏ thành mảng các gạch đầu dòng).
3. Học vấn (education): Trích xuất trường học, bằng cấp, chuyên ngành, GPA hoặc thành tích học tập khác.
4. Kỹ năng (skills): Phân loại kỹ năng thành các nhóm (category) cụ thể (ví dụ: Languages, Frameworks, Soft Skills) và danh sách kỹ năng con (items).
5. Dự án (projects): Trích xuất tên dự án, vai trò, mô tả ngắn gọn, công nghệ chính sử dụng, và đường dẫn nếu có.
6. Ngoại ngữ (languages) & Chứng chỉ (certifications): Trích xuất đầy đủ và chính xác thông tin.

CHÚ Ý:
- KHÔNG tự bịa ra thông tin không có trong tài liệu đầu vào.
- Nếu không tìm thấy thông tin cho một trường cụ thể, hãy để trống hoặc bỏ qua trường đó, tuyệt đối không bịa đặt.
- Định dạng ngày tháng bắt buộc dạng YYYY/MM (ví dụ: 2022/03) hoặc chữ "Present" cho công việc hiện tại.`;

    // Case 1: FormData containing a PDF file upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'Không tìm thấy file tải lên' }, { status: 400 });
      }

      // Convert file buffer to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const pdfBase64 = buffer.toString('base64');

      // Call Gemini 2.5 Pro with the PDF file
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
          {
            inlineData: {
              data: pdfBase64,
              mimeType: 'application/pdf',
            },
          },
          'Hãy trích xuất toàn bộ dữ liệu từ file CV PDF này và trả về JSON khớp với cấu trúc định nghĩa.'
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: ResumeDataSchema,
          temperature: 0.1,
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error('Không nhận được phản hồi trích xuất từ Gemini API');
      }

      parsedResumeData = JSON.parse(resultText);

    } 
    // Case 2: JSON payload containing raw text (LinkedIn copy-paste)
    else if (contentType.includes('application/json')) {
      const { text } = await req.json();

      if (!text || text.trim() === '') {
        return NextResponse.json({ error: 'Nội dung văn bản trống' }, { status: 400 });
      }

      // Call Gemini 2.5 Pro with raw text
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
          `Dưới đây là văn bản thô trích xuất từ hồ sơ cá nhân / LinkedIn:
          
          === HỒ SƠ ĐẦU VÀO ===
          ${text}
          ======================
          
          Hãy phân tích thông tin trên và điền vào cấu trúc dữ liệu JSON.`
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: ResumeDataSchema,
          temperature: 0.1,
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error('Không nhận được phản hồi trích xuất từ Gemini API');
      }

      parsedResumeData = JSON.parse(resultText);
    } 
    else {
      return NextResponse.json({ error: 'Định dạng yêu cầu không được hỗ trợ' }, { status: 415 });
    }

    // Date normalization helper for incoming AI dates
    const normalizeImportedDate = (dateStr?: string) => {
      if (!dateStr) return '';
      const cleaned = dateStr.trim();
      // If matches YYYY-MM, replace - with /
      if (/^\d{4}-\d{2}$/.test(cleaned)) {
        return cleaned.replace('-', '/');
      }
      // If matches dd/mm/yyyy, convert to YYYY/MM
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(cleaned)) {
        const parts = cleaned.split('/');
        return `${parts[2]}/${parts[1]}`;
      }
      return cleaned;
    };

    // Post-processing: Guarantee clean structure & generate frontend-ready unique IDs
    if (parsedResumeData) {
      // 1. Personal Info
      if (!parsedResumeData.personalInfo) {
        parsedResumeData.personalInfo = {};
      }

      // 2. Work Experience
      if (Array.isArray(parsedResumeData.workExperience)) {
        parsedResumeData.workExperience = parsedResumeData.workExperience.map((exp: WorkExperience) => ({
          ...exp,
          id: exp.id || generateId('exp'),
          startDate: normalizeImportedDate(exp.startDate),
          endDate: normalizeImportedDate(exp.endDate),
          description: Array.isArray(exp.description) ? exp.description : [exp.description || ''],
          current: exp.current ?? (exp.endDate === 'Present'),
        }));
      } else {
        parsedResumeData.workExperience = [];
      }

      // 3. Education
      if (Array.isArray(parsedResumeData.education)) {
        parsedResumeData.education = parsedResumeData.education.map((edu: Education) => ({
          ...edu,
          id: edu.id || generateId('edu'),
          startDate: normalizeImportedDate(edu.startDate),
          endDate: normalizeImportedDate(edu.endDate),
        }));
      } else {
        parsedResumeData.education = [];
      }

      // 4. Skills
      if (Array.isArray(parsedResumeData.skills)) {
        parsedResumeData.skills = parsedResumeData.skills.map((sk: SkillCategory) => ({
          ...sk,
          id: sk.id || generateId('skill'),
          items: Array.isArray(sk.items) ? sk.items : [sk.items || ''],
        }));
      } else {
        parsedResumeData.skills = [];
      }

      // 5. Projects
      if (Array.isArray(parsedResumeData.projects)) {
        parsedResumeData.projects = parsedResumeData.projects.map((proj: Project) => ({
          ...proj,
          id: proj.id || generateId('proj'),
          technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
        }));
      } else {
        parsedResumeData.projects = [];
      }

      // 6. Languages
      if (Array.isArray(parsedResumeData.languages)) {
        parsedResumeData.languages = parsedResumeData.languages.map((lang: Language) => ({
          ...lang,
          id: lang.id || generateId('lang'),
        }));
      } else {
        parsedResumeData.languages = [];
      }

      // 7. Certifications
      if (Array.isArray(parsedResumeData.certifications)) {
        parsedResumeData.certifications = parsedResumeData.certifications.map((cert: Certification) => ({
          ...cert,
          id: cert.id || generateId('cert'),
          date: normalizeImportedDate(cert.date),
        }));
      } else {
        parsedResumeData.certifications = [];
      }
    }

    return NextResponse.json({
      success: true,
      data: parsedResumeData
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Đã xảy ra lỗi hệ thống trong quá trình xử lý AI';
    console.error('Lỗi khi nạp dữ liệu CV:', error);
    return NextResponse.json({ 
      error: errMsg 
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { CVAnalysisSchema } from '@/lib/gemini/schemas';
import dbConnect from '@/lib/db';
import { ResumeVersion } from '@/models/ResumeVersion';
import { JobDescription } from '@/models/JobDescription';
import { OptimizationHistory } from '@/models/OptimizationHistory';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { resumeVersionId, jdText, company, role, language } = await req.json();

    if (!resumeVersionId || !jdText) {
      return NextResponse.json({ error: 'Missing resumeVersionId or jdText' }, { status: 400 });
    }

    // 1. Fetch current resume version
    const cvVersion = await ResumeVersion.findById(resumeVersionId);
    if (!cvVersion) {
      return NextResponse.json({ error: 'Resume version not found' }, { status: 404 });
    }

    // 2. Save the Job Description
    const jobDescription = await JobDescription.create({
      userId: cvVersion.resumeId, // Associate with resume id as owner identifier
      title: `${role || 'Position'} at ${company || 'Company'}`,
      companyName: company || 'Unknown Company',
      roleName: role || 'Unknown Role',
      rawText: jdText,
    });

    // 3. Prepare CV data for AI (sanitize to save tokens and protect sensitivity)
    const sanitizedCv = {
      personalInfo: {
        title: cvVersion.content.personalInfo?.title,
        summary: cvVersion.content.personalInfo?.summary,
      },
      workExperience: cvVersion.content.workExperience,
      education: cvVersion.content.education,
      skills: cvVersion.content.skills,
      projects: cvVersion.content.projects,
    };

    // 4. Construct System Instruction and User Prompt
    const isEnglish = language === 'en';
    const systemInstruction = isEnglish
      ? `You are a senior recruitment expert (HR Recruiter) and professional CV optimizer.
Your task is to analyze the candidate's current CV (provided in JSON format) against the provided Job Description (JD) to give specific improvement suggestions to help the CV pass Applicant Tracking Systems (ATS) and make a strong impression on interviewers.

### ANALYSIS PRINCIPLES:
1. Real suitability assessment (0-100 score): Based on the number of hard skills, years of experience, and role requirements in the JD compared to the CV.
2. Keyword Search: Identify technologies, professional skills, certifications in the JD that the CV does not currently have or does not emphasize strongly enough.
3. Smart Rewrite:
   - Target sections: Professional summary (\`personalInfo.summary\`), Work experience (\`workExperience.description\`), and Projects (\`projects.description\`).
   - Use professional action verbs (select from the action keywords in the JD).
   - Design the rewritten sentence according to the **STAR (Situation, Task, Action, Result)** formula: Contains context, specific action, technology used, and quantitative result (e.g., increased performance by 30%, reduced cost by 15%).
   - Truth preservation: Optimize the writing style, do not fabricate unreasonable/excessive experience metrics if not related to the old description.

### JSON PATH IDENTIFICATION DIRECTIVE:
When suggesting rewrites in the \`suggestedRewrites\` array, you must provide the exact \`path\` and \`itemId\` of the corresponding field in the input CV JSON:
- If modifying the summary: \`path\` = "personalInfo.summary", \`itemId\` = "" (or empty).
- If modifying the first bullet point of the first job: \`path\` = "workExperience.0.description.0", \`itemId\` = "[id_of_that_work_experience]".
- If modifying the second project description: \`path\` = "projects.1.description", \`itemId\` = "[id_of_that_project]".

### OUTPUT LANGUAGE INSTRUCTION:
IMPORTANT: You MUST generate all text-based fields in the JSON response (including 'analysisSummary', 'missingKeywords', 'reasoning', 'suggestedText', 'content') in English.`
      : `Bạn là một chuyên gia tuyển dụng (HR Recruiter) cấp cao và chuyên gia tối ưu hóa CV chuyên nghiệp. 
Nhiệm vụ của bạn là phân tích CV hiện tại của ứng viên (được cung cấp dưới dạng JSON) đối chiếu với Job Description (JD - Mô tả công việc) được cung cấp, để đưa ra những đề xuất cải thiện cụ thể giúp CV vượt qua các hệ thống lọc hồ sơ tự động (ATS) và ghi điểm mạnh mẽ với người phỏng vấn.

### NGUYÊN TẮC PHÂN TÍCH:
1. Đánh giá độ phù hợp (0-100) thực tế: Dựa trên số lượng kỹ năng cứng, số năm kinh nghiệm và vai trò yêu cầu trong JD so với CV.
2. Tìm kiếm từ khóa (Keywords): Nhận diện các công nghệ, kỹ năng chuyên môn, chứng chỉ trong JD mà CV hiện chưa có hoặc chưa nhấn mạnh đủ mạnh.
3. Viết lại thông minh (Rewrites):
   - Nhắm vào các phần: Tóm tắt bản thân (\`personalInfo.summary\`), Kinh nghiệm làm việc (\`workExperience.description\`), và Dự án (\`projects.description\`).
   - Sử dụng các động từ hành động chuyên nghiệp (chọn từ các từ khóa hành động trong JD).
   - Thiết kế câu viết lại theo công thức **STAR (Situation, Task, Action, Result)**: Chứa ngữ cảnh, hành động cụ thể, công nghệ sử dụng, và kết quả định lượng (ví dụ: tăng 30% hiệu năng, giảm 15% chi phí).
   - Bảo toàn sự thật: Tối ưu hóa cách hành văn chứ không được bịa đặt ra các số liệu kinh nghiệm quá mức không hợp lý nếu không liên quan tới mô tả cũ.

### HƯỚNG DẪN XÁC ĐỊNH JSON PATH:
Khi đề xuất viết lại trong mảng \`suggestedRewrites\`, bạn phải cung cấp chính xác \`path\` và \`itemId\` của trường dữ liệu tương ứng trong CV JSON đầu vào:
- Nếu sửa phần summary: \`path\` = "personalInfo.summary", \`itemId\` = "" (hoặc rỗng).
- Nếu sửa bullet point thứ nhất của công việc đầu tiên: \`path\` = "workExperience.0.description.0", \`itemId\` = "[id_cua_work_experience_do]".
- Nếu sửa mô tả dự án thứ hai: \`path\` = "projects.1.description", \`itemId\` = "[id_cua_project_do]".

### HƯỚNG DẪN NGÔN NGỮ ĐẦU RA:
LƯU Ý QUAN TRỌNG: Bạn PHẢI tạo tất cả các trường dữ liệu dạng văn bản trong phản hồi JSON (bao gồm 'analysisSummary', 'missingKeywords', 'reasoning', 'suggestedText', 'content') bằng tiếng Việt.`;

    const userPrompt = `
      Hãy đối chiếu CV và JD sau đây để thực hiện tối ưu hóa:
      
      === JOB DESCRIPTION (JD) ===
      Công ty: ${company || 'Chưa rõ'}
      Vị trí: ${role || 'Chưa rõ'}
      Mô tả công việc chi tiết:
      ${jdText}
      
      === RESUME DATA (JSON) ===
      ${JSON.stringify(sanitizedCv, null, 2)}
    `;

    // 5. Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: CVAnalysisSchema,
        temperature: 0.15,
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API");
    }

    const suggestions = JSON.parse(resultText);

    // 6. Save in OptimizationHistory
    const history = await OptimizationHistory.create({
      resumeVersionId,
      jobDescriptionId: jobDescription._id,
      suggestions,
      applied: false,
    });

    // 7. Update ResumeVersion tags with JD and target role
    cvVersion.tags = {
      role: role || cvVersion.tags?.role || 'Optimized CV',
      company: company || cvVersion.tags?.company,
      jdId: jobDescription._id,
    };
    await cvVersion.save();

    return NextResponse.json({
      historyId: history._id,
      jobDescriptionId: jobDescription._id,
      suggestions,
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Đã xảy ra lỗi trong quá trình xử lý AI';
    console.error('Lỗi khi tối ưu hóa CV:', error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

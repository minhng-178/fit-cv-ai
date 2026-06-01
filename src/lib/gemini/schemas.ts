import { Schema, Type } from '@google/genai';

export const CVAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.INTEGER,
      description: "Điểm độ phù hợp giữa CV hiện tại với JD (từ 0 đến 100)."
    },
    analysisSummary: {
      type: Type.STRING,
      description: "Đánh giá tóm tắt về điểm mạnh và các điểm còn thiếu sót của CV so với JD."
    },
    missingKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Danh sách các từ khóa kỹ thuật hoặc kỹ năng quan trọng trong JD nhưng chưa xuất hiện hoặc chưa rõ ràng trong CV."
    },
    suggestedAdditions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          section: { 
            type: Type.STRING, 
            description: "Phần cần thêm vào trong CV (ví dụ: 'skills', 'projects', 'certifications')." 
          },
          content: { 
            type: Type.STRING, 
            description: "Nội dung đề xuất viết thêm vào." 
          },
          reasoning: { 
            type: Type.STRING, 
            description: "Giải thích tại sao việc thêm nội dung này giúp CV phù hợp hơn với JD." 
          }
        },
        required: ["section", "content", "reasoning"]
      },
      description: "Đề xuất thêm mới những mục quan trọng bị thiếu mà ứng viên có thể có."
    },
    suggestedRewrites: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          path: { 
            type: Type.STRING, 
            description: "Đường dẫn JSON trỏ đến đúng trường dữ liệu cần sửa. Ví dụ: 'workExperience.0.description.1' đại diện cho bullet point thứ 2 trong công việc đầu tiên, hoặc 'personalInfo.summary'." 
          },
          itemId: {
            type: Type.STRING,
            description: "ID của phần tử mảng cần chỉnh sửa (ví dụ: ID của workExperience như 'exp-1'). Nhằm đảm bảo ánh xạ chính xác trên frontend kể cả khi vị trí mảng thay đổi."
          },
          originalText: { 
            type: Type.STRING, 
            description: "Nội dung văn bản gốc cần được thay thế." 
          },
          suggestedText: { 
            type: Type.STRING, 
            description: "Nội dung văn bản đã được AI viết lại tối ưu. Phải chèn các từ khóa phù hợp của JD, sử dụng các động từ hành động mạnh (Action Verbs) và áp dụng phương pháp STAR (Situation, Task, Action, Result) để mô tả tác động thực tế." 
          },
          reasoning: { 
            type: Type.STRING, 
            description: "Lý do viết lại và cách nó giúp ghi điểm với nhà tuyển dụng." 
          }
        },
        required: ["path", "itemId", "originalText", "suggestedText", "reasoning"]
      },
      description: "Danh sách các đề xuất viết lại chi tiết cho từng phần trong CV."
    }
  },
  required: ["overallScore", "analysisSummary", "missingKeywords", "suggestedAdditions", "suggestedRewrites"]
};

export const ResumeDataSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    personalInfo: {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING, description: "Họ và tên đầy đủ" },
        title: { type: Type.STRING, description: "Vị trí công việc chính, ví dụ: Senior Frontend Engineer" },
        email: { type: Type.STRING, description: "Địa chỉ email liên hệ" },
        phone: { type: Type.STRING, description: "Số điện thoại liên hệ" },
        website: { type: Type.STRING, description: "Trang web cá nhân hoặc portfolio" },
        github: { type: Type.STRING, description: "Hồ sơ GitHub cá nhân" },
        linkedin: { type: Type.STRING, description: "Hồ sơ LinkedIn cá nhân" },
        location: { type: Type.STRING, description: "Địa điểm sinh sống (ví dụ: Hà Nội, Việt Nam)" },
        summary: { type: Type.STRING, description: "Tóm tắt ngắn gọn thế mạnh nghề nghiệp, mục tiêu và năng lực bản thân." },
      }
    },
    workExperience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING, description: "Tên công ty hoặc tổ chức làm việc" },
          position: { type: Type.STRING, description: "Vị trí, chức vụ đảm nhận" },
          location: { type: Type.STRING, description: "Địa điểm làm việc" },
          startDate: { type: Type.STRING, description: "Tháng/năm bắt đầu (ví dụ: 2022/03)" },
          endDate: { type: Type.STRING, description: "Tháng/năm kết thúc (ví dụ: 2024/05 hoặc 'Present')" },
          current: { type: Type.BOOLEAN, description: "Đang làm việc tại đây hay không" },
          description: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Danh sách các gạch đầu dòng mô tả nhiệm vụ và thành tựu"
          }
        }
      }
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          school: { type: Type.STRING, description: "Tên trường học/học viện" },
          degree: { type: Type.STRING, description: "Bằng cấp (ví dụ: Cử nhân, Kỹ sư)" },
          fieldOfStudy: { type: Type.STRING, description: "Chuyên ngành đào tạo" },
          location: { type: Type.STRING, description: "Địa điểm trường học" },
          startDate: { type: Type.STRING, description: "Tháng/năm bắt đầu (ví dụ: 2018/09)" },
          endDate: { type: Type.STRING, description: "Tháng/năm kết thúc (ví dụ: 2022/06)" },
          description: { type: Type.STRING, description: "GPA, đề tài tốt nghiệp hoặc thành tích học tập nổi bật" }
        }
      }
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "Tên phân loại kỹ năng (ví dụ: Programming Languages, Frameworks, Soft Skills)" },
          items: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Danh sách kỹ năng"
          }
        }
      }
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Tên dự án" },
          role: { type: Type.STRING, description: "Vai trò trong dự án (ví dụ: Lead Developer)" },
          description: { type: Type.STRING, description: "Mô tả mục tiêu, kết quả dự án" },
          technologies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Công nghệ sử dụng"
          },
          url: { type: Type.STRING, description: "Đường dẫn demo/github dự án" }
        }
      }
    },
    languages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          language: { type: Type.STRING, description: "Ngôn ngữ (ví dụ: Tiếng Anh)" },
          proficiency: { type: Type.STRING, description: "Trình độ sử dụng (ví dụ: IELTS 7.5, Lưu loát)" }
        }
      }
    },
    certifications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Tên chứng chỉ" },
          issuer: { type: Type.STRING, description: "Nơi cấp chứng chỉ" },
          date: { type: Type.STRING, description: "Thời gian cấp (ví dụ: 2023/11)" }
        }
      }
    }
  }
};

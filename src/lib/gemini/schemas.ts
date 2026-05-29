import { Schema } from '@google/genai';

export const CVAnalysisSchema: Schema = {
  type: 'OBJECT' as any,
  properties: {
    overallScore: {
      type: 'INTEGER' as any,
      description: "Điểm độ phù hợp giữa CV hiện tại với JD (từ 0 đến 100)."
    },
    analysisSummary: {
      type: 'STRING' as any,
      description: "Đánh giá tóm tắt về điểm mạnh và các điểm còn thiếu sót của CV so với JD."
    },
    missingKeywords: {
      type: 'ARRAY' as any,
      items: { type: 'STRING' as any },
      description: "Danh sách các từ khóa kỹ thuật hoặc kỹ năng quan trọng trong JD nhưng chưa xuất hiện hoặc chưa rõ ràng trong CV."
    },
    suggestedAdditions: {
      type: 'ARRAY' as any,
      items: {
        type: 'OBJECT' as any,
        properties: {
          section: { 
            type: 'STRING' as any, 
            description: "Phần cần thêm vào trong CV (ví dụ: 'skills', 'projects', 'certifications')." 
          },
          content: { 
            type: 'STRING' as any, 
            description: "Nội dung đề xuất viết thêm vào." 
          },
          reasoning: { 
            type: 'STRING' as any, 
            description: "Giải thích tại sao việc thêm nội dung này giúp CV phù hợp hơn với JD." 
          }
        },
        required: ["section", "content", "reasoning"]
      },
      description: "Đề xuất thêm mới những mục quan trọng bị thiếu mà ứng viên có thể có."
    },
    suggestedRewrites: {
      type: 'ARRAY' as any,
      items: {
        type: 'OBJECT' as any,
        properties: {
          path: { 
            type: 'STRING' as any, 
            description: "Đường dẫn JSON trỏ đến đúng trường dữ liệu cần sửa. Ví dụ: 'workExperience.0.description.1' đại diện cho bullet point thứ 2 trong công việc đầu tiên, hoặc 'personalInfo.summary'." 
          },
          itemId: {
            type: 'STRING' as any,
            description: "ID của phần tử mảng cần chỉnh sửa (ví dụ: ID của workExperience như 'exp-1'). Nhằm đảm bảo ánh xạ chính xác trên frontend kể cả khi vị trí mảng thay đổi."
          },
          originalText: { 
            type: 'STRING' as any, 
            description: "Nội dung văn bản gốc cần được thay thế." 
          },
          suggestedText: { 
            type: 'STRING' as any, 
            description: "Nội dung văn bản đã được AI viết lại tối ưu. Phải chèn các từ khóa phù hợp của JD, sử dụng các động từ hành động mạnh (Action Verbs) và áp dụng phương pháp STAR (Situation, Task, Action, Result) để mô tả tác động thực tế." 
          },
          reasoning: { 
            type: 'STRING' as any, 
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

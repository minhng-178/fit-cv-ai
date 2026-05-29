import { ResumeData } from '@/types/resume';

// Helper to parse date string formatted as dd/mm/yyyy
export function parseDateString(val: string): Date | null {
  if (!val) return null;
  const parts = val.split('/');
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1; // Date months are 0-indexed
    const y = parseInt(parts[2], 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      const dt = new Date(y, m, d);
      // Ensure date object values match the input values (handling invalid dates like 31/02)
      if (dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d) {
        return dt;
      }
    }
  }
  return null;
}

// Check if string matches dd/mm/yyyy format
export function isValidDateFormat(val: string): boolean {
  if (!val) return true;
  // If it's a special keyword representing present/current, it's valid
  if (val.toLowerCase() === 'present' || val === 'Hiện tại' || val === '') return true;
  
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(val)) return false;
  
  return parseDateString(val) !== null;
}

// Check Vietnamese phone number format
export function isValidVietnamesePhone(phone: string): boolean {
  if (!phone) return true;
  // Remove spaces, dashes, periods
  const cleanPhone = phone.replace(/[\s.-]/g, '');
  // Matches: 0 or +84 followed by 9 digits starting with 3, 5, 7, 8, 9
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
  return phoneRegex.test(cleanPhone);
}

// Check valid email format
export function isValidEmail(email: string): boolean {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateResumeData(data: ResumeData): Record<string, string> {
  const errors: Record<string, string> = {};
  const today = new Date();
  // Set to end of day to avoid timezone/current time offset issues
  today.setHours(23, 59, 59, 999);

  // 1. Personal Info Validation
  const personal = data.personalInfo || {};
  if (!personal.fullName?.trim()) {
    errors['personalInfo.fullName'] = 'Họ và tên không được để trống';
  }
  
  if (!personal.email?.trim()) {
    errors['personalInfo.email'] = 'Email không được để trống';
  } else if (!isValidEmail(personal.email)) {
    errors['personalInfo.email'] = 'Email không đúng định dạng';
  }
  
  if (!personal.phone?.trim()) {
    errors['personalInfo.phone'] = 'Số điện thoại không được để trống';
  } else if (!isValidVietnamesePhone(personal.phone)) {
    errors['personalInfo.phone'] = 'Số điện thoại không hợp lệ (ví dụ: 0901234567)';
  }

  // 2. Work Experience Validation
  if (Array.isArray(data.workExperience)) {
    data.workExperience.forEach((exp, i) => {
      if (!exp.company?.trim()) {
        errors[`workExperience.${i}.company`] = 'Tên công ty không được để trống';
      }
      if (!exp.position?.trim()) {
        errors[`workExperience.${i}.position`] = 'Vị trí / Chức danh không được để trống';
      }

      let startDt: Date | null = null;
      let endDt: Date | null = null;

      if (!exp.startDate?.trim()) {
        errors[`workExperience.${i}.startDate`] = 'Ngày bắt đầu không được để trống';
      } else if (!isValidDateFormat(exp.startDate)) {
        errors[`workExperience.${i}.startDate`] = 'Định dạng ngày không hợp lệ (dd/mm/yyyy)';
      } else {
        startDt = parseDateString(exp.startDate);
        if (startDt && startDt > today) {
          errors[`workExperience.${i}.startDate`] = 'Ngày bắt đầu không được ở tương lai';
        }
      }

      const isCurrent = exp.current || exp.endDate?.toLowerCase() === 'present' || exp.endDate === 'Hiện tại';
      if (!isCurrent) {
        if (!exp.endDate?.trim()) {
          errors[`workExperience.${i}.endDate`] = 'Ngày kết thúc không được để trống';
        } else if (!isValidDateFormat(exp.endDate)) {
          errors[`workExperience.${i}.endDate`] = 'Định dạng ngày không hợp lệ (dd/mm/yyyy)';
        } else {
          endDt = parseDateString(exp.endDate);
          if (endDt && endDt > today) {
            errors[`workExperience.${i}.endDate`] = 'Ngày kết thúc không được ở tương lai';
          }
        }
      }

      if (startDt && endDt && endDt < startDt) {
        errors[`workExperience.${i}.endDate`] = 'Ngày kết thúc không được trước ngày bắt đầu';
      }
    });
  }

  // 3. Education Validation
  if (Array.isArray(data.education)) {
    data.education.forEach((edu, i) => {
      if (!edu.school?.trim()) {
        errors[`education.${i}.school`] = 'Tên trường học không được để trống';
      }
      if (!edu.degree?.trim()) {
        errors[`education.${i}.degree`] = 'Bằng cấp không được để trống';
      }
      if (!edu.fieldOfStudy?.trim()) {
        errors[`education.${i}.fieldOfStudy`] = 'Chuyên ngành không được để trống';
      }

      let startDt: Date | null = null;
      let endDt: Date | null = null;

      if (!edu.startDate?.trim()) {
        errors[`education.${i}.startDate`] = 'Ngày bắt đầu không được để trống';
      } else if (!isValidDateFormat(edu.startDate)) {
        errors[`education.${i}.startDate`] = 'Định dạng ngày không hợp lệ (dd/mm/yyyy)';
      } else {
        startDt = parseDateString(edu.startDate);
        if (startDt && startDt > today) {
          errors[`education.${i}.startDate`] = 'Ngày bắt đầu không được ở tương lai';
        }
      }

      if (!edu.endDate?.trim()) {
        errors[`education.${i}.endDate`] = 'Ngày kết thúc không được để trống';
      } else if (!isValidDateFormat(edu.endDate)) {
        errors[`education.${i}.endDate`] = 'Định dạng ngày không hợp lệ (dd/mm/yyyy)';
      } else {
        endDt = parseDateString(edu.endDate);
      }

      if (startDt && endDt && endDt < startDt) {
        errors[`education.${i}.endDate`] = 'Ngày kết thúc không được trước ngày bắt đầu';
      }
    });
  }

  // 4. Projects Validation
  if (Array.isArray(data.projects)) {
    data.projects.forEach((proj, i) => {
      if (!proj.name?.trim()) {
        errors[`projects.${i}.name`] = 'Tên dự án không được để trống';
      }
      if (!proj.role?.trim()) {
        errors[`projects.${i}.role`] = 'Vai trò không được để trống';
      }
    });
  }

  // 5. Skills Validation
  if (Array.isArray(data.skills)) {
    data.skills.forEach((skill, i) => {
      if (!skill.category?.trim()) {
        errors[`skills.${i}.category`] = 'Tên nhóm kỹ năng không được để trống';
      }
    });
  }

  // 6. Languages Validation
  if (Array.isArray(data.languages)) {
    data.languages.forEach((lang, i) => {
      if (!lang.language?.trim()) {
        errors[`languages.${i}.language`] = 'Ngôn ngữ không được để trống';
      }
      if (!lang.proficiency?.trim()) {
        errors[`languages.${i}.proficiency`] = 'Trình độ không được để trống';
      }
    });
  }

  // 7. Certifications Validation
  if (Array.isArray(data.certifications)) {
    data.certifications.forEach((cert, i) => {
      if (!cert.name?.trim()) {
        errors[`certifications.${i}.name`] = 'Tên chứng chỉ không được để trống';
      }
      if (!cert.issuer?.trim()) {
        errors[`certifications.${i}.issuer`] = 'Tổ chức cấp không được để trống';
      }

      if (!cert.date?.trim()) {
        errors[`certifications.${i}.date`] = 'Ngày cấp không được để trống';
      } else if (!isValidDateFormat(cert.date)) {
        errors[`certifications.${i}.date`] = 'Định dạng ngày không hợp lệ (dd/mm/yyyy)';
      } else {
        const dateDt = parseDateString(cert.date);
        if (dateDt && dateDt > today) {
          errors[`certifications.${i}.date`] = 'Ngày cấp không được ở tương lai';
        }
      }
    });
  }

  return errors;
}

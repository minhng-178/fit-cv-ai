'use client';

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { 
  GenericForm, 
  FormRow, 
  FormTextField, 
  FormTextArea, 
  FormDatePicker, 
  FormCheckbox 
} from '@/components/ui/generic-form';
import { FormSkillSelector } from '@/components/ui/skill-selector';
import LayoutPanel from './LayoutPanel';

export default function ContentPanel(): React.ReactElement {
  const {
    resumeData,
    activeSection,
    updateField,
    addWorkExperience,
    removeWorkExperience,
    addEducation,
    removeEducation,
    addSkillCategory,
    removeSkillCategory,
    addProject,
    removeProject,
    addLanguage,
    removeLanguage,
    addCertification,
    removeCertification
  } = useResumeStore();

  const sections = [
    { id: 'personalInfo', label: 'Thông tin cá nhân' },
    { id: 'workExperience', label: 'Kinh nghiệm' },
    { id: 'education', label: 'Học vấn' },
    { id: 'skills', label: 'Kỹ năng' },
    { id: 'projects', label: 'Dự án' },
    { id: 'languages', label: 'Ngoại ngữ' },
    { id: 'certifications', label: 'Chứng chỉ' },
    { id: 'layout', label: 'Bố cục & Giao diện' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Section Label Header */}
      <div className="h-12 border-b border-zinc-800/80 bg-[#0f0f11]/20 px-6 flex items-center shrink-0 select-none">
        <span className="text-[10px] sm:text-xs text-zinc-400 font-bold uppercase tracking-wider">
          {sections.find((s) => s.id === activeSection)?.label}
        </span>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto h-full max-w-full">
        {activeSection === 'personalInfo' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Thông tin cá nhân</h2>
              <p className="text-sm text-zinc-400">Giới thiệu ngắn gọn thông tin liên lạc và định hướng của bạn.</p>
            </div>
            
            <GenericForm pathPrefix="personalInfo">
              <FormRow>
                <FormTextField name="fullName" label="Họ và tên" placeholder="Ví dụ: Nguyễn Văn A" />
                <FormTextField name="title" label="Vị trí ứng tuyển" placeholder="Ví dụ: Senior Frontend Engineer" />
                <FormTextField name="email" label="Email" placeholder="name@example.com" type="email" />
                <FormTextField name="phone" label="Số điện thoại" placeholder="Ví dụ: +84 901 234 567" />
                <FormTextField name="website" label="Website" placeholder="https://mywebsite.com" />
                <FormTextField name="location" label="Địa chỉ" placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh" />
                <FormTextField name="github" label="GitHub" placeholder="github.com/username" />
                <FormTextField name="linkedin" label="LinkedIn" placeholder="linkedin.com/in/username" />
              </FormRow>
              <FormTextArea name="summary" label="Tóm tắt tiểu sử bản thân" placeholder="Viết một đoạn tóm tắt ngắn làm nổi bật kinh nghiệm và mục tiêu cốt lõi của bạn..." rows={4} />
            </GenericForm>
          </div>
        )}

        {activeSection === 'workExperience' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-zinc-100 mb-1">Kinh nghiệm làm việc</h2>
                <p className="text-sm text-zinc-400">Trình bày lịch sử làm việc gần đây nhất của bạn.</p>
              </div>
              <Button
                onClick={addWorkExperience}
                variant="outline"
                size="sm"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              >
                <Plus size={14} /> Thêm mới
              </Button>
            </div>

            <div className="space-y-4">
              {resumeData.workExperience?.map((exp, idx) => (
                <div key={exp.id} className="p-4 bg-[#0f0f11]/40 border border-zinc-800/80 rounded-xl space-y-4 relative animate-fade-in">
                  <Button
                    onClick={() => removeWorkExperience(exp.id)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-zinc-500 hover:text-rose-455 hover:bg-transparent h-8 w-8"
                    title="Xóa công việc này"
                  >
                    <Trash2 size={15} />
                  </Button>

                  <h3 className="text-sm font-semibold text-zinc-300">Công việc #{idx + 1}</h3>

                  <GenericForm pathPrefix={`workExperience.${idx}`}>
                    <FormRow>
                      <FormTextField name="company" label="Công ty" placeholder="Ví dụ: TechCorp" />
                      <FormTextField name="position" label="Vị trí / Chức danh" placeholder="Ví dụ: Frontend Lead" />
                    </FormRow>

                    <FormTextField name="location" label="Địa điểm" placeholder="Ví dụ: TP. Hồ Chí Minh" />

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <FormDatePicker name="startDate" label="Thời gian bắt đầu" placeholder="dd/mm/yyyy" />
                      <FormDatePicker name="endDate" label="Thời gian kết thúc" placeholder={exp.current ? 'Hiện tại' : 'dd/mm/yyyy'} disabled={exp.current} />
                    </div>

                    <FormCheckbox
                      name="current"
                      label="Đang làm việc tại đây"
                      className="mt-2"
                      onCheckedChange={(isChecked) => {
                        if (isChecked) {
                          updateField(`workExperience.${idx}.endDate`, 'Present');
                        } else {
                          updateField(`workExperience.${idx}.endDate`, '');
                        }
                      }}
                    />
                  </GenericForm>

                  {/* Bullet points for job description */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Mô tả công việc (Các gạch đầu dòng)</label>
                    {exp.description?.map((bullet, bulletIdx) => (
                      <div key={bulletIdx} className="flex gap-2 items-center">
                        <span className="text-zinc-650 text-xs">•</span>
                        <Input
                          type="text"
                          value={bullet}
                          onChange={(e) => updateField(`workExperience.${idx}.description.${bulletIdx}`, e.target.value)}
                          placeholder="Ví dụ: Đã tái cấu trúc giao diện hệ thống Dashboard..."
                        />
                        <Button
                          onClick={() => {
                            const newDesc = [...(exp.description || [])];
                            newDesc.splice(bulletIdx, 1);
                            updateField(`workExperience.${idx}.description`, newDesc);
                          }}
                          variant="ghost"
                          size="icon"
                          className="text-zinc-650 hover:text-rose-455 h-8 w-8 shrink-0 hover:bg-transparent"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={() => {
                        const newDesc = [...(exp.description || []), ''];
                        updateField(`workExperience.${idx}.description`, newDesc);
                      }}
                      variant="link"
                      className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 mt-2 font-medium p-0"
                    >
                      <Plus size={12} /> Thêm gạch đầu dòng
                    </Button>
                  </div>
                </div>
              ))}
              {(!resumeData.workExperience || resumeData.workExperience.length === 0) && (
                <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">Chưa có thông tin kinh nghiệm. Bấm "Thêm mới".</div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'education' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-zinc-100 mb-1">Học vấn</h2>
                <p className="text-sm text-zinc-400">Trình bày lịch sử đào tạo học vấn của bạn.</p>
              </div>
              <Button
                onClick={addEducation}
                variant="outline"
                size="sm"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              >
                <Plus size={14} /> Thêm mới
              </Button>
            </div>

            <div className="space-y-4">
              {resumeData.education?.map((edu, idx) => (
                <div key={edu.id} className="p-4 bg-[#0f0f11]/40 border border-zinc-800/80 rounded-xl space-y-4 relative animate-fade-in">
                  <Button
                    onClick={() => removeEducation(edu.id)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-zinc-500 hover:text-rose-455 hover:bg-transparent h-8 w-8"
                  >
                    <Trash2 size={15} />
                  </Button>

                  <h3 className="text-sm font-semibold text-zinc-300">Trường học #{idx + 1}</h3>

                  <GenericForm pathPrefix={`education.${idx}`}>
                    <FormRow>
                      <FormTextField name="school" label="Trường học / Học viện" placeholder="Ví dụ: Đại học Khoa học Tự nhiên" />
                      <FormTextField name="degree" label="Bằng cấp" placeholder="Ví dụ: Cử nhân" />
                    </FormRow>

                    <FormTextField name="fieldOfStudy" label="Chuyên ngành" placeholder="Ví dụ: Khoa học máy tính" />

                    <div className="grid grid-cols-2 gap-4">
                      <FormDatePicker name="startDate" label="Thời gian bắt đầu" placeholder="dd/mm/yyyy" />
                      <FormDatePicker name="endDate" label="Thời gian kết thúc" placeholder="dd/mm/yyyy" />
                    </div>

                    <FormTextArea name="description" label="Thành tích / Ghi chú" placeholder="Ví dụ: Tốt nghiệp loại Giỏi, GPA 3.6/4.0..." rows={2} />
                  </GenericForm>
                </div>
              ))}
              {(!resumeData.education || resumeData.education.length === 0) && (
                <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">Chưa có thông tin học vấn. Bấm "Thêm mới".</div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'skills' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-zinc-100 mb-1">Kỹ năng kỹ thuật</h2>
                <p className="text-sm text-zinc-400">Phân loại kỹ năng để nhà tuyển dụng dễ đánh giá.</p>
              </div>
              <Button
                onClick={addSkillCategory}
                variant="outline"
                size="sm"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              >
                <Plus size={14} /> Thêm nhóm
              </Button>
            </div>

            <div className="space-y-4">
              {resumeData.skills?.map((sk, idx) => (
                <div key={sk.id} className="p-4 bg-[#0f0f11]/40 border border-zinc-800/80 rounded-xl space-y-4 relative animate-fade-in">
                  <Button
                    onClick={() => removeSkillCategory(sk.id)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-zinc-500 hover:text-rose-455 hover:bg-transparent h-8 w-8"
                  >
                    <Trash2 size={15} />
                  </Button>

                  <h3 className="text-sm font-semibold text-zinc-300">Nhóm #{idx + 1}</h3>

                  <GenericForm pathPrefix={`skills.${idx}`}>
                    <div className="flex flex-col gap-4">
                      <FormTextField name="category" label="Tên nhóm kỹ năng" placeholder="Ví dụ: Frontend Frameworks" />
                      <FormSkillSelector
                        name="items"
                        label="Kỹ năng"
                        placeholder="Tìm hoặc thêm kỹ năng..."
                      />
                    </div>
                  </GenericForm>
                </div>
              ))}
              {(!resumeData.skills || resumeData.skills.length === 0) && (
                <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">Chưa có thông tin kỹ năng. Bấm "Thêm nhóm".</div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-zinc-100 mb-1">Dự án cá nhân</h2>
                <p className="text-sm text-zinc-400">Các sản phẩm hoặc đóng góp mã nguồn mở.</p>
              </div>
              <Button
                onClick={addProject}
                variant="outline"
                size="sm"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              >
                <Plus size={14} /> Thêm mới
              </Button>
            </div>

            <div className="space-y-4">
              {resumeData.projects?.map((proj, idx) => (
                <div key={proj.id} className="p-4 bg-[#0f0f11]/40 border border-zinc-800/80 rounded-xl space-y-4 relative animate-fade-in">
                  <Button
                    onClick={() => removeProject(proj.id)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-zinc-500 hover:text-rose-455 hover:bg-transparent h-8 w-8"
                  >
                    <Trash2 size={15} />
                  </Button>

                  <h3 className="text-sm font-semibold text-zinc-300">Dự án #{idx + 1}</h3>

                  <GenericForm pathPrefix={`projects.${idx}`}>
                    <FormRow>
                      <FormTextField name="name" label="Tên dự án" placeholder="Ví dụ: FitCV.ai" />
                      <FormTextField name="role" label="Vai trò" placeholder="Ví dụ: Lead Fullstack Developer" />
                      <FormTextField name="url" label="Đường dẫn (URL)" placeholder="https://github.com/..." />
                    </FormRow>

                    <FormSkillSelector
                      name="technologies"
                      label="Công nghệ sử dụng"
                      placeholder="Tìm hoặc thêm công nghệ..."
                    />

                    <FormTextArea name="description" label="Mô tả dự án" placeholder="Mô tả mục tiêu, hành động và kết quả đạt được từ dự án..." rows={3} />
                  </GenericForm>
                </div>
              ))}
              {(!resumeData.projects || resumeData.projects.length === 0) && (
                <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">Chưa có thông tin dự án. Bấm "Thêm mới".</div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'languages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-zinc-100 mb-1">Ngoại ngữ</h2>
                <p className="text-sm text-zinc-400">Trình độ ngoại ngữ và khả năng giao tiếp.</p>
              </div>
              <Button
                onClick={addLanguage}
                variant="outline"
                size="sm"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              >
                <Plus size={14} /> Thêm mới
              </Button>
            </div>

            <div className="space-y-4">
              {resumeData.languages?.map((lang, idx) => (
                <div key={lang.id} className="p-4 bg-[#0f0f11]/40 border border-zinc-800/80 rounded-xl space-y-4 relative animate-fade-in">
                  <Button
                    onClick={() => removeLanguage(lang.id)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-zinc-500 hover:text-rose-455 hover:bg-transparent h-8 w-8"
                  >
                    <Trash2 size={15} />
                  </Button>

                  <GenericForm pathPrefix={`languages.${idx}`}>
                    <FormRow>
                      <FormTextField name="language" label="Ngôn ngữ" placeholder="Ví dụ: Tiếng Anh" />
                      <FormTextField name="proficiency" label="Mức độ thành thạo" placeholder="Ví dụ: IELTS 7.0 / Bản xứ" />
                    </FormRow>
                  </GenericForm>
                </div>
              ))}
              {(!resumeData.languages || resumeData.languages.length === 0) && (
                <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">Chưa có thông tin ngoại ngữ. Bấm "Thêm mới".</div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'certifications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-zinc-100 mb-1">Chứng chỉ</h2>
                <p className="text-sm text-zinc-400">Các chứng nhận chuyên môn của bạn.</p>
              </div>
              <Button
                onClick={addCertification}
                variant="outline"
                size="sm"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              >
                <Plus size={14} /> Thêm mới
              </Button>
            </div>

            <div className="space-y-4">
              {resumeData.certifications?.map((cert, idx) => (
                <div key={cert.id} className="p-4 bg-[#0f0f11]/40 border border-zinc-800/80 rounded-xl space-y-4 relative animate-fade-in">
                  <Button
                    onClick={() => removeCertification(cert.id)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-zinc-500 hover:text-rose-455 hover:bg-transparent h-8 w-8"
                  >
                    <Trash2 size={15} />
                  </Button>

                  <GenericForm pathPrefix={`certifications.${idx}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormTextField name="name" label="Tên chứng chỉ" placeholder="Ví dụ: AWS Certified Practitioner" />
                      <FormTextField name="issuer" label="Tổ chức cấp" placeholder="Ví dụ: Amazon Web Services" />
                      <FormDatePicker name="date" label="Ngày cấp" placeholder="dd/mm/yyyy" />
                    </div>
                  </GenericForm>
                </div>
              ))}
              {(!resumeData.certifications || resumeData.certifications.length === 0) && (
                <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">Chưa có thông tin chứng chỉ nào. Bấm "Thêm mới".</div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'layout' && (
          <LayoutPanel />
        )}
      </div>
    </div>
  );
}

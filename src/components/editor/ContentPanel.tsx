'use client';

import React, { useState } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Sparkles } from 'lucide-react';
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
import ImportModal from './ImportModal';
import { translations } from '@/lib/i18n/translations';

export default function ContentPanel(): React.ReactElement {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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
    removeCertification,
    language
  } = useResumeStore();

  const t = translations[language];

  const sections = [
    { id: 'personalInfo', label: t.personalInfo },
    { id: 'workExperience', label: t.workExperience },
    { id: 'education', label: t.education },
    { id: 'skills', label: t.skills },
    { id: 'projects', label: t.projects },
    { id: 'languages', label: t.languages },
    { id: 'certifications', label: t.certifications },
    { id: 'layout', label: t.layout },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Section Label Header */}
      <div className="h-12 border-b border-border bg-muted/20 px-6 flex items-center shrink-0 select-none">
        <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider">
          {sections.find((s) => s.id === activeSection)?.label}
        </span>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto h-full max-w-full">
        {activeSection === 'personalInfo' && (
          <div className="space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">{t.personalInfo}</h2>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' 
                    ? 'Giới thiệu ngắn gọn thông tin liên lạc và định hướng của bạn.' 
                    : 'Briefly introduce your contact details and professional summary.'}
                </p>
              </div>
              <Button
                onClick={() => setIsImportModalOpen(true)}
                variant="outline"
                size="sm"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 flex items-center gap-1.5 shrink-0 animate-pulse hover:animate-none cursor-pointer"
              >
                <Sparkles size={14} /> {t.importModalBtn}
              </Button>
            </div>
            
            <GenericForm pathPrefix="personalInfo">
              <FormRow>
                <FormTextField name="fullName" label={t.fullName} placeholder={t.fullNamePlaceholder} required />
                <FormTextField name="title" label={t.jobTitle} placeholder={t.jobTitlePlaceholder} />
                <FormTextField name="email" label={t.email} placeholder={t.emailPlaceholder} type="email" required />
                <FormTextField name="phone" label={t.phone} placeholder={t.phonePlaceholder} required />
                <FormTextField name="website" label={t.website} placeholder={t.websitePlaceholder} />
                <FormTextField name="location" label={t.location} placeholder={t.locationPlaceholder} />
                <FormTextField name="github" label={t.github} placeholder={t.githubPlaceholder} />
                <FormTextField name="linkedin" label={t.linkedin} placeholder={t.linkedinPlaceholder} />
              </FormRow>
              <FormTextArea name="summary" label={t.summary} placeholder={t.summaryPlaceholder} rows={5} />
            </GenericForm>
          </div>
        )}

        {activeSection === 'workExperience' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">{t.workExperience}</h2>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' 
                    ? 'Trình bày lịch sử làm việc gần đây nhất của bạn.' 
                    : 'Describe your recent employment history.'}
                </p>
              </div>
              <Button
                onClick={addWorkExperience}
                variant="outline"
                size="sm"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer"
              >
                <Plus size={14} /> {t.addNew}
              </Button>
            </div>

            <div className="space-y-4">
              {resumeData.workExperience?.map((exp, idx) => (
                <div key={exp.id} className="p-4 bg-muted/10 border border-border rounded-xl space-y-4 relative animate-fade-in">
                  <Button
                    onClick={() => removeWorkExperience(exp.id)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-muted-foreground hover:text-rose-500 hover:bg-transparent h-8 w-8 cursor-pointer"
                    title={t.deleteItem}
                  >
                    <Trash2 size={15} />
                  </Button>

                  <h3 className="text-sm font-semibold text-foreground">{t.jobIndexHeader} #{idx + 1}</h3>

                  <GenericForm pathPrefix={`workExperience.${idx}`}>
                    <FormRow>
                      <FormTextField name="company" label={t.company} placeholder={t.companyPlaceholder} required />
                      <FormTextField name="position" label={t.position} placeholder={t.positionPlaceholder} required />
                    </FormRow>

                    <FormTextField name="location" label={t.locationLabel} placeholder={t.locationPlaceholder} />

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <FormDatePicker name="startDate" label={t.startDate} placeholder="YYYY/MM" required />
                      <FormDatePicker name="endDate" label={t.endDate} placeholder={exp.current ? t.present : 'YYYY/MM'} disabled={exp.current} required={!exp.current} />
                    </div>

                    <FormCheckbox
                      name="current"
                      label={t.currentJob}
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
                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      {language === 'vi' ? 'Mô tả công việc (Các gạch đầu dòng)' : 'Job Description (Bullet Points)'}
                    </label>
                    {exp.description?.map((bullet, bulletIdx) => (
                      <div key={bulletIdx} className="flex gap-2 items-center">
                        <span className="text-zinc-650 text-xs">•</span>
                        <Input
                          type="text"
                          value={bullet}
                          onChange={(e) => updateField(`workExperience.${idx}.description.${bulletIdx}`, e.target.value)}
                          placeholder={t.bulletPointPlaceholder}
                        />
                        <Button
                          onClick={() => {
                            const newDesc = [...(exp.description || [])];
                            newDesc.splice(bulletIdx, 1);
                            updateField(`workExperience.${idx}.description`, newDesc);
                          }}
                          variant="ghost"
                          size="icon"
                          className="text-zinc-650 hover:text-rose-455 h-8 w-8 shrink-0 hover:bg-transparent cursor-pointer"
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
                      className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 mt-2 font-medium p-0 cursor-pointer"
                    >
                      <Plus size={12} /> {t.addBulletPoint}
                    </Button>
                  </div>
                </div>
              ))}
              {(!resumeData.workExperience || resumeData.workExperience.length === 0) && (
                <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                  {t.noData}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'education' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">{t.education}</h2>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' 
                    ? 'Trình bày lịch sử đào tạo học vấn của bạn.' 
                    : 'List your educational background.'}
                </p>
              </div>
              <Button
                onClick={addEducation}
                variant="outline"
                size="sm"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer"
              >
                <Plus size={14} /> {t.addNew}
              </Button>
            </div>

            <div className="space-y-4">
              {resumeData.education?.map((edu, idx) => (
                <div key={edu.id} className="p-4 bg-muted/10 border border-border rounded-xl space-y-4 relative animate-fade-in">
                  <Button
                    onClick={() => removeEducation(edu.id)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-muted-foreground hover:text-rose-500 hover:bg-transparent h-8 w-8 cursor-pointer"
                    title={t.deleteItem}
                  >
                    <Trash2 size={15} />
                  </Button>

                  <h3 className="text-sm font-semibold text-foreground">{t.schoolIndexHeader} #{idx + 1}</h3>

                  <GenericForm pathPrefix={`education.${idx}`}>
                    <FormRow>
                      <FormTextField name="school" label={t.school} placeholder={t.schoolPlaceholder} required />
                      <FormTextField name="degree" label={t.degree} placeholder={t.degreePlaceholder} required />
                    </FormRow>

                    <FormTextField name="fieldOfStudy" label={t.fieldOfStudy} placeholder={t.fieldOfStudyPlaceholder} required />

                    <div className="grid grid-cols-2 gap-4">
                      <FormDatePicker name="startDate" label={t.startDate} placeholder="YYYY/MM" required />
                      <FormDatePicker name="endDate" label={t.endDate} placeholder="YYYY/MM" required />
                    </div>

                    <FormTextArea name="description" label={t.eduDescription} placeholder={t.eduDescriptionPlaceholder} rows={2} />
                  </GenericForm>
                </div>
              ))}
              {(!resumeData.education || resumeData.education.length === 0) && (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                  {t.noData}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'skills' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">{t.skills}</h2>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' 
                    ? 'Phân loại kỹ năng để nhà tuyển dụng dễ đánh giá.' 
                    : 'Categorize your skills for recruiters to easily evaluate.'}
                </p>
              </div>
              <Button
                onClick={addSkillCategory}
                variant="outline"
                size="sm"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer"
              >
                <Plus size={14} /> {t.addGroup}
              </Button>
            </div>

            <div className="space-y-4">
              {resumeData.skills?.map((sk, idx) => (
                <div key={sk.id} className="p-4 bg-muted/10 border border-border rounded-xl space-y-4 relative animate-fade-in">
                  <Button
                    onClick={() => removeSkillCategory(sk.id)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-muted-foreground hover:text-rose-500 hover:bg-transparent h-8 w-8 cursor-pointer"
                    title={t.deleteItem}
                  >
                    <Trash2 size={15} />
                  </Button>

                  <h3 className="text-sm font-semibold text-foreground">{t.skillsIndexHeader} #{idx + 1}</h3>

                  <GenericForm pathPrefix={`skills.${idx}`}>
                    <div className="flex flex-col gap-4">
                      <FormTextField name="category" label={t.skillCategoryName} placeholder={t.skillCategoryPlaceholder} required />
                      <FormSkillSelector
                        name="items"
                        label={t.skillItemsLabel}
                        placeholder={t.skillItemsPlaceholder}
                      />
                    </div>
                  </GenericForm>
                </div>
              ))}
              {(!resumeData.skills || resumeData.skills.length === 0) && (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                  {t.noSkills}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">{t.projects}</h2>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' 
                    ? 'Các sản phẩm hoặc đóng góp mã nguồn mở.' 
                    : 'Showcase your personal products or open source contributions.'}
                </p>
              </div>
              <Button
                onClick={addProject}
                variant="outline"
                size="sm"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer"
              >
                <Plus size={14} /> {t.addNew}
              </Button>
            </div>

            <div className="space-y-4">
              {resumeData.projects?.map((proj, idx) => (
                <div key={proj.id} className="p-4 bg-muted/10 border border-border rounded-xl space-y-4 relative animate-fade-in">
                  <Button
                    onClick={() => removeProject(proj.id)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-muted-foreground hover:text-rose-500 hover:bg-transparent h-8 w-8 cursor-pointer"
                    title={t.deleteItem}
                  >
                    <Trash2 size={15} />
                  </Button>

                  <h3 className="text-sm font-semibold text-foreground">{t.projectIndexHeader} #{idx + 1}</h3>

                  <GenericForm pathPrefix={`projects.${idx}`}>
                    <FormRow>
                      <FormTextField name="name" label={t.projectName} placeholder={t.projectNamePlaceholder} required />
                      <FormTextField name="role" label={t.projectRole} placeholder={t.projectRolePlaceholder} required />
                      <FormTextField name="url" label={t.projectUrl} placeholder={t.projectUrlPlaceholder} />
                    </FormRow>

                    <FormSkillSelector
                      name="technologies"
                      label={t.projectTech}
                      placeholder={t.projectTechPlaceholder}
                    />

                    <FormTextArea name="description" label={t.projectDesc} placeholder={t.projectDescPlaceholder} rows={3} />
                  </GenericForm>
                </div>
              ))}
              {(!resumeData.projects || resumeData.projects.length === 0) && (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                  {t.noData}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'languages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">{t.languages}</h2>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' 
                    ? 'Trình độ ngoại ngữ và khả năng giao tiếp.' 
                    : 'Your language proficiency and communication skills.'}
                </p>
              </div>
              <Button
                onClick={addLanguage}
                variant="outline"
                size="sm"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer"
              >
                <Plus size={14} /> {t.addNew}
              </Button>
            </div>

            <div className="space-y-4">
              {resumeData.languages?.map((lang, idx) => (
                <div key={lang.id} className="p-4 bg-muted/10 border border-border rounded-xl space-y-4 relative animate-fade-in">
                  <Button
                    onClick={() => removeLanguage(lang.id)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-muted-foreground hover:text-rose-500 hover:bg-transparent h-8 w-8 cursor-pointer"
                    title={t.deleteItem}
                  >
                    <Trash2 size={15} />
                  </Button>

                  <GenericForm pathPrefix={`languages.${idx}`}>
                    <FormRow>
                      <FormTextField name="language" label={t.langLanguage} placeholder={t.langLanguagePlaceholder} required />
                      <FormTextField name="proficiency" label={t.langProficiency} placeholder={t.langProficiencyPlaceholder} required />
                    </FormRow>
                  </GenericForm>
                </div>
              ))}
              {(!resumeData.languages || resumeData.languages.length === 0) && (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                  {t.noLang}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'certifications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">{t.certifications}</h2>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' 
                    ? 'Các chứng nhận chuyên môn của bạn.' 
                    : 'Your professional certifications.'}
                </p>
              </div>
              <Button
                onClick={addCertification}
                variant="outline"
                size="sm"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer"
              >
                <Plus size={14} /> {t.addNew}
              </Button>
            </div>

            <div className="space-y-4">
              {resumeData.certifications?.map((cert, idx) => (
                <div key={cert.id} className="p-4 bg-muted/10 border border-border rounded-xl space-y-4 relative animate-fade-in">
                  <Button
                    onClick={() => removeCertification(cert.id)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-muted-foreground hover:text-rose-500 hover:bg-transparent h-8 w-8 cursor-pointer"
                    title={t.deleteItem}
                  >
                    <Trash2 size={15} />
                  </Button>

                  <GenericForm pathPrefix={`certifications.${idx}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormTextField name="name" label={t.certName} placeholder={t.certNamePlaceholder} required />
                      <FormTextField name="issuer" label={t.certIssuer} placeholder={t.certIssuerPlaceholder} required />
                      <FormDatePicker name="date" label={t.certDate} placeholder="YYYY/MM" required />
                    </div>
                  </GenericForm>
                </div>
              ))}
              {(!resumeData.certifications || resumeData.certifications.length === 0) && (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                  {t.noCert}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'layout' && (
          <LayoutPanel />
        )}
      </div>

      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </div>
  );
}

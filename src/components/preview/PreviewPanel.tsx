'use client';

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Button } from '@/components/ui/button';
import { Globe, Mail, Phone, MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/assets/icons';
import { translations } from '@/lib/i18n/translations';

export default function PreviewPanel() {
  const { resumeData, zoomRatio, setZoomRatio, language } = useResumeStore();
  const t = translations[language] || translations.vi;

  const info = resumeData.personalInfo || {};
  const experiences = resumeData.workExperience || [];
  const educations = resumeData.education || [];
  const skills = resumeData.skills || [];
  const projects = resumeData.projects || [];
  const languages = resumeData.languages || [];
  const certifications = resumeData.certifications || [];

  const layout = resumeData.layout || {
    template: 'two-columns-left',
    themeColor: 'emerald',
    fontFamily: 'sans',
    fontSize: 'md',
  };

  const themeColor = layout.themeColor || 'emerald';
  const colorMap = {
    emerald: { text: 'text-emerald-600', border: 'border-emerald-600', fill: 'fill-emerald-600' },
    blue: { text: 'text-blue-600', border: 'border-blue-600', fill: 'fill-blue-600' },
    indigo: { text: 'text-indigo-600', border: 'border-indigo-600', fill: 'fill-indigo-600' },
    rose: { text: 'text-rose-600', border: 'border-rose-600', fill: 'fill-rose-600' },
    slate: { text: 'text-zinc-800', border: 'border-zinc-800', fill: 'fill-zinc-850' },
  };
  const colors = colorMap[themeColor as keyof typeof colorMap] || colorMap.emerald;

  const fontFamily = layout.fontFamily || 'sans';
  const fontClass = 
    fontFamily === 'serif' 
      ? 'font-serif' 
      : fontFamily === 'display' 
      ? 'font-display' 
      : 'font-sans';

  const getFontSizeClass = (element: 'title' | 'subtitle' | 'heading' | 'item-title' | 'body' | 'sub') => {
    const size = layout.fontSize || 'md';
    if (size === 'sm') {
      switch (element) {
        case 'title': return 'text-2xl';
        case 'subtitle': return 'text-base';
        case 'heading': return 'text-[11px]';
        case 'item-title': return 'text-[10.5px]';
        case 'body': return 'text-[9.5px]';
        case 'sub': return 'text-[8.5px]';
      }
    }
    if (size === 'lg') {
      switch (element) {
        case 'title': return 'text-4xl';
        case 'subtitle': return 'text-xl';
        case 'heading': return 'text-sm';
        case 'item-title': return 'text-[12.5px]';
        case 'body': return 'text-[12px]';
        case 'sub': return 'text-[10.5px]';
      }
    }
    // md (default)
    switch (element) {
      case 'title': return 'text-3xl';
      case 'subtitle': return 'text-lg';
      case 'heading': return 'text-xs';
      case 'item-title': return 'text-xs';
      case 'body': return 'text-[11px]';
      case 'sub': return 'text-[9.5px]';
    }
  };

  const handleZoomIn = () => setZoomRatio(prev => Math.min(1.2, prev + 0.05));
  const handleZoomOut = () => setZoomRatio(prev => Math.max(0.5, prev - 0.05));

  // helper components to render sections modularly
  const SummarySection = () => {
    if (!info.summary) return null;
    return (
      <section className="space-y-1.5">
        <h2 className={`${getFontSizeClass('heading')} font-bold uppercase tracking-widest border-b pb-1 ${colors.text} ${colors.border}`}>{t.previewSummary}</h2>
        <p className={`${getFontSizeClass('body')} leading-relaxed text-zinc-700 whitespace-pre-line`}>
          {info.summary}
        </p>
      </section>
    );
  };

  const ExperienceSection = () => {
    if (experiences.length === 0) return null;
    return (
      <section className="space-y-3">
        <h2 className={`${getFontSizeClass('heading')} font-bold uppercase tracking-widest border-b pb-1 ${colors.text} ${colors.border}`}>{t.previewExperience}</h2>
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="space-y-1">
              <div className="flex justify-between items-baseline">
                <h3 className={`${getFontSizeClass('item-title')} font-bold text-zinc-900`}>{exp.position}</h3>
                <span className={`${getFontSizeClass('sub')} text-zinc-500 font-mono shrink-0`}>
                  {exp.startDate} – {exp.endDate || (exp.current ? t.present : '')}
                </span>
              </div>
              <div className={`flex justify-between items-baseline ${getFontSizeClass('sub')} text-zinc-600 font-medium`}>
                <span>{exp.company}</span>
                <span>{exp.location}</span>
              </div>
              {exp.description && exp.description.length > 0 && (
                <ul className={`list-disc pl-4 ${getFontSizeClass('sub')} text-zinc-700 space-y-0.5 leading-relaxed mt-1`}>
                  {exp.description.map((bullet, bIdx) => (
                    <li key={bIdx}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const ProjectsSection = () => {
    if (projects.length === 0) return null;
    return (
      <section className="space-y-3">
        <h2 className={`${getFontSizeClass('heading')} font-bold uppercase tracking-widest border-b pb-1 ${colors.text} ${colors.border}`}>{t.previewProjects}</h2>
        <div className="space-y-3">
          {projects.map((proj) => (
            <div key={proj.id} className="space-y-1">
              <div className="flex justify-between items-baseline">
                <h3 className={`${getFontSizeClass('item-title')} font-bold text-zinc-900`}>{proj.name}</h3>
                <span className={`${getFontSizeClass('sub')} font-mono text-zinc-500 shrink-0`}>{proj.role}</span>
              </div>
              {proj.url && (
                <div className={`${getFontSizeClass('sub')} ${colors.text} font-mono truncate`}>{proj.url}</div>
              )}
              <p className={`${getFontSizeClass('body')} leading-relaxed text-zinc-700`}>{proj.description}</p>
              {proj.technologies && proj.technologies.length > 0 && (
                <div className={`${getFontSizeClass('sub')} text-zinc-500`}>
                  <span className="font-semibold text-zinc-600">{t.previewTechUsed} </span>
                  {proj.technologies.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const EducationSection = () => {
    if (educations.length === 0) return null;
    return (
      <section className="space-y-3">
        <h2 className={`${getFontSizeClass('heading')} font-bold uppercase tracking-widest border-b pb-1 ${colors.text} ${colors.border}`}>{t.previewEducation}</h2>
        <div className="space-y-3">
          {educations.map((edu) => (
            <div key={edu.id} className="space-y-0.5">
              <div className="flex justify-between items-baseline">
                <h3 className={`${getFontSizeClass('item-title')} font-bold text-zinc-900`}>{edu.school}</h3>
                <span className={`${getFontSizeClass('sub')} text-zinc-500 font-mono shrink-0`}>
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
              <div className={`${getFontSizeClass('body')} text-zinc-700`}>
                {edu.degree} – {edu.fieldOfStudy}
              </div>
              {edu.description && (
                <p className={`${getFontSizeClass('sub')} italic text-zinc-550 leading-relaxed mt-0.5`}>{edu.description}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const SkillsSection = () => {
    if (skills.length === 0) return null;
    return (
      <section className="space-y-2.5">
        <h2 className={`${getFontSizeClass('heading')} font-bold uppercase tracking-widest border-b pb-1 ${colors.text} ${colors.border}`}>{t.previewSkills}</h2>
        <div className="space-y-2">
          {skills.map((sk) => (
            <div key={sk.id} className="space-y-0.5">
              <h4 className={`${getFontSizeClass('sub')} font-bold text-zinc-900 uppercase`}>{sk.category}</h4>
              <div className="flex flex-wrap gap-1">
                {sk.items?.map((item, itemIdx) => (
                  <span key={itemIdx} className={`${getFontSizeClass('sub')} bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded font-medium`}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const LanguagesSection = () => {
    if (languages.length === 0) return null;
    return (
      <section className="space-y-2.5">
        <h2 className={`${getFontSizeClass('heading')} font-bold uppercase tracking-widest border-b pb-1 ${colors.text} ${colors.border}`}>{t.previewLanguages}</h2>
        <div className="space-y-1.5">
          {languages.map((lang) => (
            <div key={lang.id} className={`${getFontSizeClass('body')} flex justify-between`}>
              <span className="font-semibold text-zinc-800">{lang.language}</span>
              <span className={`${getFontSizeClass('sub')} text-zinc-600 font-mono`}>{lang.proficiency}</span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const CertificationsSection = () => {
    if (certifications.length === 0) return null;
    return (
      <section className="space-y-2.5">
        <h2 className={`${getFontSizeClass('heading')} font-bold uppercase tracking-widest border-b pb-1 ${colors.text} ${colors.border}`}>{t.previewCertifications}</h2>
        <div className="space-y-2">
          {certifications.map((cert) => (
            <div key={cert.id} className="space-y-0.5">
              <h4 className={`${getFontSizeClass('sub')} font-bold text-zinc-800 leading-tight`}>{cert.name}</h4>
              <div className={`flex justify-between ${getFontSizeClass('sub')} text-zinc-550`}>
                <span>{cert.issuer}</span>
                <span className="font-mono">{cert.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const template = layout.template || 'two-columns-left';

  const renderTemplateContent = () => {
    if (template === 'single-column') {
      return (
        <div className="space-y-6">
          <SummarySection />
          <ExperienceSection />
          <ProjectsSection />
          <EducationSection />
          <div className="border-t border-zinc-250 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-6">
              <SkillsSection />
            </div>
            <div className="space-y-6">
              <LanguagesSection />
            </div>
            <div className="space-y-6">
              <CertificationsSection />
            </div>
          </div>
        </div>
      );
    }

    if (template === 'two-columns-right') {
      return (
        <div className="grid grid-cols-3 gap-6">
          {/* Left Meta Column: Skills, Languages, Certifications (1/3 width) */}
          <div className="col-span-1 border-r border-zinc-200 pr-6 space-y-6">
            <SkillsSection />
            <LanguagesSection />
            <CertificationsSection />
          </div>
          {/* Right Main Column: Experience, Education, Projects (2/3 width) */}
          <div className="col-span-2 space-y-6">
            <SummarySection />
            <ExperienceSection />
            <ProjectsSection />
            <EducationSection />
          </div>
        </div>
      );
    }

    // Default: two-columns-left
    return (
      <div className="grid grid-cols-3 gap-6">
        {/* Left Main Column: Experience, Education, Projects (2/3 width) */}
        <div className="col-span-2 space-y-6">
          <SummarySection />
          <ExperienceSection />
          <ProjectsSection />
          <EducationSection />
        </div>
        {/* Right Meta Column: Skills, Languages, Certifications (1/3 width) */}
        <div className="col-span-1 border-l border-zinc-200 pl-6 space-y-6">
          <SkillsSection />
          <LanguagesSection />
          <CertificationsSection />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full items-center">
      {/* Zoom Toolbar */}
      <div className="flex items-center gap-1 mb-3 bg-[#0c0c0e]/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-800/80 shrink-0 select-none">
        <Button 
          onClick={handleZoomOut} 
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </Button>
        <span className="text-xs text-zinc-400 font-mono flex items-center min-w-[36px] justify-center select-none">
          {Math.round(zoomRatio * 100)}%
        </span>
        <Button 
          onClick={handleZoomIn} 
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </Button>
      </div>

      {/* Sheet Container */}
      <div className="flex-1 w-full overflow-auto flex justify-center items-start p-4">
        {/* A4 Page Shell */}
        <div 
          className={`bg-white text-zinc-900 shadow-2xl origin-top transition-transform duration-100 ease-out border border-zinc-200 ${fontClass}`}
          style={{
            width: '210mm',
            minHeight: '297mm',
            transform: `scale(${zoomRatio})`,
            padding: '20mm 15mm 20mm 15mm',
            boxSizing: 'border-box'
          }}
          id="cv-preview-page"
        >
          {/* Header */}
          <header className={`border-b-2 ${colors.border} pb-5 mb-5`}>
            <h1 className={`${getFontSizeClass('title')} font-bold tracking-tight text-zinc-900 mb-1`}>
              {info.fullName || t.previewDefaultName}
            </h1>
            <p className={`${getFontSizeClass('subtitle')} font-medium ${colors.text} mb-3`}>
              {info.title || t.previewDefaultTitle}
            </p>
            
            {/* Contacts Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4 text-[10.5px] text-zinc-600 font-sans">
              {info.email && (
                <span className="flex items-center gap-1.5 truncate">
                  <Mail size={11} className="text-zinc-400 shrink-0" /> {info.email}
                </span>
              )}
              {info.phone && (
                <span className="flex items-center gap-1.5 truncate">
                  <Phone size={11} className="text-zinc-400 shrink-0" /> {info.phone}
                </span>
              )}
              {info.location && (
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin size={11} className="text-zinc-400 shrink-0" /> {info.location}
                </span>
              )}
              {info.website && (
                <span className="flex items-center gap-1.5 truncate">
                  <Globe size={11} className="text-zinc-400 shrink-0" /> {info.website}
                </span>
              )}
              {info.github && (
                <span className="flex items-center gap-1.5 truncate">
                  <GithubIcon className="w-[11px] h-[11px] text-zinc-400 shrink-0" /> {info.github}
                </span>
              )}
              {info.linkedin && (
                <span className="flex items-center gap-1.5 truncate">
                  <LinkedinIcon className="w-[11px] h-[11px] text-zinc-400 shrink-0" /> {info.linkedin}
                </span>
              )}
            </div>
          </header>

          {/* Core Layout Structure */}
          {renderTemplateContent()}
        </div>
      </div>
    </div>
  );
}


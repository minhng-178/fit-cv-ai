'use client';

import React from 'react';
import { 
  User, Briefcase, GraduationCap, Code, FolderGit2, Globe, Award, ChevronLeft, ChevronRight, Palette
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar
} from '@/components/ui/sidebar';
import { useResumeStore } from '@/store/useResumeStore';
import { translations } from '@/lib/i18n/translations';

interface EditorSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function EditorSidebar({ activeSection, setActiveSection }: EditorSidebarProps) {
  const { language } = useResumeStore();
  const t = translations[language];

  const sections = [
    { id: 'personalInfo', label: t.personalInfo, icon: User },
    { id: 'workExperience', label: t.workExperience, icon: Briefcase },
    { id: 'education', label: t.education, icon: GraduationCap },
    { id: 'skills', label: t.skills, icon: Code },
    { id: 'projects', label: t.projects, icon: FolderGit2 },
    { id: 'languages', label: t.languages, icon: Globe },
    { id: 'certifications', label: t.certifications, icon: Award },
    { id: 'layout', label: t.layout, icon: Palette },
  ];

  const { state, toggleSidebar } = useSidebar();

  return (
    <Sidebar 
      collapsible="icon" 
      className="absolute md:relative left-0 top-0 h-full border-r border-border bg-sidebar z-20"
    >
      {/* Floating Toggle Button on the side border */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="absolute -right-3 top-5 z-30 bg-background text-muted-foreground hover:text-emerald-400 border border-border hover:border-emerald-500/50 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer"
        title={state === 'expanded' ? t.collapseSidebar : t.expandSidebar}
      >
        {state === 'expanded' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <SidebarHeader className="p-4 border-b border-border shrink-0">
        <h3 className="hidden group-data-[collapsible=icon]:!hidden md:block text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
          {t.categoriesHeader}
        </h3>
      </SidebarHeader>
      
      <SidebarContent className="p-2 gap-1 overflow-y-auto">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <SidebarMenuItem key={sec.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveSection(sec.id)}
                      isActive={isActive}
                      tooltip={sec.label}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border-l-4 border-emerald-500 font-medium' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                      }`}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden text-sm">{sec.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border flex items-center justify-center shrink-0">
        <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center bg-muted font-bold text-foreground text-xs shadow-sm">
          N
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

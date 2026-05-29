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

interface EditorSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function EditorSidebar({ activeSection, setActiveSection }: EditorSidebarProps) {
  const sections = [
    { id: 'personalInfo', label: 'Thông tin cá nhân', icon: User },
    { id: 'workExperience', label: 'Kinh nghiệm', icon: Briefcase },
    { id: 'education', label: 'Học vấn', icon: GraduationCap },
    { id: 'skills', label: 'Kỹ năng', icon: Code },
    { id: 'projects', label: 'Dự án', icon: FolderGit2 },
    { id: 'languages', label: 'Ngoại ngữ', icon: Globe },
    { id: 'certifications', label: 'Chứng chỉ', icon: Award },
    { id: 'layout', label: 'Bố cục & Giao diện', icon: Palette },
  ];

  const { state, toggleSidebar } = useSidebar();

  return (
    <Sidebar 
      collapsible="icon" 
      className="absolute md:relative left-0 top-0 h-full border-r border-zinc-800/80 bg-[#0f0f11]/30 z-20"
    >
      {/* Floating Toggle Button on the side border */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="absolute -right-3 top-5 z-30 bg-zinc-950 text-zinc-400 hover:text-emerald-400 border border-zinc-800 hover:border-emerald-500/50 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-md shadow-black/60 cursor-pointer"
        title={state === 'expanded' ? 'Thu nhỏ' : 'Mở rộng'}
      >
        {state === 'expanded' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <SidebarHeader className="p-4 border-b border-zinc-800/80 shrink-0">
        <h3 className="hidden group-data-[collapsible=icon]:!hidden md:block text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2">
          Các danh mục
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
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
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

      <SidebarFooter className="p-4 border-t border-zinc-800/80 flex items-center justify-center shrink-0">
        <div className="h-8 w-8 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-950 font-bold text-zinc-200 text-xs shadow-lg shadow-black/40">
          N
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

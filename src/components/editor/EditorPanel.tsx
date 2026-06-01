'use client';

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { SidebarProvider } from '@/components/ui/sidebar';
import { EditorSidebar } from './EditorSidebar';
import ContentPanel from './ContentPanel';

export default function EditorPanel(): React.ReactElement {
  const { activeSection, setActiveSection } = useResumeStore();

  return (
    <SidebarProvider defaultOpen={true} className="h-full w-full min-h-0 bg-transparent flex-row flex">
      <div className="flex h-full w-full bg-card/50 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl relative">
        <EditorSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <ContentPanel />
      </div>
    </SidebarProvider>
  );
}

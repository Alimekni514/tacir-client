"use client";
import { BookOpen, Calendar, Users, FileText, BarChart2 } from "lucide-react";
import { SidebarProvider } from "../../components/ui/sidebar";
import AppSidebar from "../../components/sidebar/AppSidebar";

function ProjectHolderLayout({ children }) {
  const sidebarData = {
    formations: [
      {
        name: "Mes Formations",
        icon: BookOpen,
        url: "/project-holder/trainings",
        items: [],
      },
      {
        name: "Mes outputs",
        icon: BookOpen,
        url: "/project-holder/outputs",
        items: [],
      },
    ],
  };

  return (
    <div className="h-screen w-screen bg-gray-50">
      <SidebarProvider>
        <div className="w-full flex h-full">
          <AppSidebar data={sidebarData} />
          <div className="w-full overflow-y-auto p-6">{children}</div>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default ProjectHolderLayout;

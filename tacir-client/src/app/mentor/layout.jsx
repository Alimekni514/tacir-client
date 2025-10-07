"use client";
import React from "react";
import { Users, BookOpen, FileText, User, ClipboardList } from "lucide-react";
import { SidebarProvider } from "../../components/ui/sidebar";
import AppSidebar from "../../components/sidebar/AppSidebar";
import { SidebarTrigger } from "../../components/ui/sidebar";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function MentorLayout({ children }) {
  const pathname = usePathname();

  const sidebarData = {
    Navigation: [
      { name: "Tableau de bord", icon: ClipboardList, url: "/mentor" },
      { name: "Mon profil", icon: User, url: "/mentor/profile" },
    ],
    Management: [
      {
        name: "Sessions de formation",
        icon: BookOpen,
        url: "/mentor/trainings",
        description: "Gérer la présence et les sessions",
      },
      {
        name: "Participants",
        icon: Users,
        url: "/mentor/trainings/participants",
        description: "Voir et gérer tous les participants",
      },
      {
        name: "Outputs des projets",
        icon: FileText,
        url: "/mentor/trainings/outputs",
        description: "Examiner et évaluer les soumissions",
      },
    ],
  };

  const generateBreadcrumbs = () => {
    // Remove "mentor" from the breadcrumb list
    const paths = pathname.split("/").filter(Boolean).slice(1);

    return paths.map((path, index) => {
      const href = `/mentor/${paths.slice(0, index + 1).join("/")}`;
      const isLast = index === paths.length - 1;
      let label = path.replace(/-/g, " ");

      // Traductions
      if (label === "trainings") label = "Sessions de formation";
      if (label === "participants") label = "Participants";
      if (label === "outputs") label = "Outputs des projets";
      if (label === "profile") label = "Mon profil";

      return { label, href, isLast };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="h-screen max-w-screen">
      <SidebarProvider>
        <div className="w-full flex">
          <AppSidebar data={sidebarData} />
          <main className="flex-1 overflow-y-auto p-6 bg-tacir-lightgray">
            {/* Top bar: SidebarTrigger + Breadcrumb */}
            <div className="flex items-center justify-start gap-3 px-6 mb-4">
              <SidebarTrigger />

              <Breadcrumb>
                <BreadcrumbList className="flex items-center space-x-2 text-sm">
                  {/* Hardcoded "Mentor" as the root breadcrumb */}
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/mentor"
                      className="py-1 rounded text-tacir-darkblue hover:bg-tacir-lightgray transition"
                    >
                      Mentor
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  {/* Loop through remaining pages */}
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {crumb.isLast ? (
                          <BreadcrumbPage className="py-1 text-tacir-pink font-semibold">
                            {crumb.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            href={crumb.href}
                            className="py-1 rounded text-tacir-darkblue hover:bg-tacir-lightgray transition"
                          >
                            {crumb.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Page content */}
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default MentorLayout;

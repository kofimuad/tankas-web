import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { BottomNav } from "@/components/bottom-nav";

/**
 * Mobile-first chrome: bottom tab bar below `lg`, sidebar + topbar above it.
 * Pages supply only their content and never repeat the navigation.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="hidden lg:block">
          <AppTopbar />
        </div>
        <main className="flex-1 pb-28 lg:pb-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}

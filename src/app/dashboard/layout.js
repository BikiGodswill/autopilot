import DashboardShell from "@/components/layout/DashboardShell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <DashboardShell userEmail={user?.email}>{children}</DashboardShell>;
}

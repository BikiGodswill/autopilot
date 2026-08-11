import { HiOutlineTrendingUp } from "react-icons/hi";
import Card from "@/components/ui/Card";
import ScoreCircle from "@/components/seo/ScoreCircle";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: websites } = await supabase
    .from("websites")
    .select("id, name, url, seo_score")
    .eq("owner_id", user?.id ?? "");

  const hasWebsites = websites && websites.length > 0;

  return (
    <div>
      <h1 className="font-display text-xl font-bold capitalize text-ink">
        Welcome{user?.email ? `, ${user.email.split("@")[0]}` : ""}
      </h1>
      <p className="mt-1 text-sm text-ash-500">
        Here&rsquo;s the state of your SEO across all connected websites.
      </p>

      {!hasWebsites ? (
        <Card className="mt-8 flex flex-col items-center gap-3 p-12 text-center">
          <HiOutlineTrendingUp className="text-signal-teal" size={28} />
          <p className="font-medium text-ink">No websites connected yet</p>
          <p className="max-w-sm text-sm text-ash-500">
            Website management, audits, and scoring arrive in the next build
            phase — this dashboard will populate automatically once
            they&rsquo;re wired up.
          </p>
        </Card>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {websites.map((site) => (
            <Card key={site.id} hover className="flex items-center gap-4 p-5">
              <ScoreCircle score={site.seo_score ?? 0} size={64} />
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{site.name}</p>
                <p className="truncate text-xs text-ash-400">{site.url}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

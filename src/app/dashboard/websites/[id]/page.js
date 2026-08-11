import WebsiteDetail from "@/components/dashboard/WebsiteDetail";

export default function WebsiteDetailPage({ params }) {
  return <WebsiteDetail websiteId={params.id} />;
}

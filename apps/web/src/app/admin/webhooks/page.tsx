import AdminGapPage from "@/components/admin/gap-page";
import { adminBackendGaps } from "@/lib/admin/service";

export const metadata = {
  title: "Webhook",
};

export default function AdminWebhooksPage() {
  return (
    <AdminGapPage
      title="Webhook"
      description="Log webhook sẽ có bộ lọc provider/event/status và JSON detail an toàn khi backend hỗ trợ."
      gap={adminBackendGaps.webhooks}
    />
  );
}

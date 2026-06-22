import AdminGapPage from "@/components/admin/gap-page";
import { adminBackendGaps } from "@/lib/admin/service";

export const metadata = {
  title: "Tồn kho",
};

export default function AdminInventoryPage() {
  return (
    <AdminGapPage
      title="Tồn kho"
      description="Tồn kho riêng, bộ lọc low-stock, điều chỉnh tồn và lịch sử movement cần endpoint admin inventory."
      gap={adminBackendGaps.inventory}
    />
  );
}

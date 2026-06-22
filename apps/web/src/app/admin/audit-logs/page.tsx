import AdminGapPage from "@/components/admin/gap-page";
import { adminBackendGaps } from "@/lib/admin/service";

export const metadata = {
  title: "Audit logs",
};

export default function AdminAuditLogsPage() {
  return (
    <AdminGapPage
      title="Audit logs"
      description="Audit log sẽ hiển thị actor, action, entity, timestamp và before/after detail khi có endpoint."
      gap={adminBackendGaps.auditLogs}
    />
  );
}

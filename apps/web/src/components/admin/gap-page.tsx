import { AdminEmpty, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";

export default function AdminGapPage({
  title,
  description,
  gap,
}: {
  title: string;
  description: string;
  gap: string;
}) {
  return (
    <>
      <AdminPageHeader title={title} description={description} />
      <AdminPanel>
        <AdminEmpty title="Chờ hợp đồng backend" description={gap} />
      </AdminPanel>
    </>
  );
}

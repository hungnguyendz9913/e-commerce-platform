import ProfileForm from "@/components/customer/profile-form";

export const metadata = {
  title: "Hồ sơ | ShopVN",
};

export default function CustomerProfilePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">Hồ sơ cá nhân</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Email là thông tin định danh; các trường còn lại được cập nhật qua hợp đồng hồ sơ hiện có.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}


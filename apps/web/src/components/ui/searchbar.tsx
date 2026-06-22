import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <form
      action="/products"
      method="get"
      role="search"
      className="flex h-11 w-full items-center gap-3 rounded-xl bg-gray-100 px-4 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100"
    >
      <Search className="size-5 shrink-0 text-slate-400" strokeWidth={2} />

      <input
        aria-label="Tìm kiếm sản phẩm"
        type="search"
        name="search"
        required
        placeholder="Tìm kiếm sản phẩm..."
        className="w-full min-w-0 border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
      />
    </form>
  );
}

import { ShoppingBag } from "lucide-react";

export default function Logo() {
  return (
    <span className="flex shrink-0 items-center gap-2.5">
      <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600">
        <ShoppingBag className="size-5 text-white" strokeWidth={2.25} />
      </div>

      <span className="hidden text-xl font-bold text-gray-950 sm:inline">
        ShopVN
      </span>
    </span>
  );
}

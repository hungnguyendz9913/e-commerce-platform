"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShoppingCart } from "lucide-react";
import { addCartItem } from "@/lib/commerce/cart";
import { CommerceApiError } from "@/lib/commerce/types";

type AddToCartButtonProps = {
  productId: string;
  productName: string;
  inStock: boolean;
  stockQuantity: number;
  quantity?: number;
  className?: string;
  compact?: boolean;
};

export default function AddToCartButton({
  productId,
  productName,
  inStock,
  stockQuantity,
  quantity = 1,
  className = "",
  compact = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const disabled = loading || !inStock || stockQuantity <= 0;
  const redirectTo = useMemo(() => {
    const query = searchParams.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }, [pathname, searchParams]);

  const handleAdd = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      await addCartItem(productId, quantity);
      setMessage(`Đã thêm ${productName} vào giỏ hàng.`);
      router.refresh();
    } catch (error) {
      if (error instanceof CommerceApiError && error.status === 401) {
        router.push(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
        return;
      }

      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể thêm sản phẩm vào giỏ hàng.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={compact ? "min-w-0" : ""}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleAdd}
        className={`inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 ${className}`}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ShoppingCart className="size-4" aria-hidden="true" />
        )}
        <span>{compact ? "Thêm" : loading ? "Đang thêm..." : "Thêm vào giỏ"}</span>
      </button>

      {!inStock || stockQuantity <= 0 ? (
        <p className="mt-2 text-xs font-medium text-red-600">Sản phẩm đã hết hàng.</p>
      ) : message ? (
        <p
          className={`mt-2 text-xs font-medium ${
            isError ? "text-red-600" : "text-emerald-700"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import AddToCartButton from "@/components/commerce/add-to-cart-button";

type ProductPurchasePanelProps = {
  productId: string;
  productName: string;
  inStock: boolean;
  stockQuantity: number;
};

export default function ProductPurchasePanel({
  productId,
  productName,
  inStock,
  stockQuantity,
}: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = Math.max(1, stockQuantity);
  const updateQuantity = (nextQuantity: number) => {
    setQuantity(Math.min(maxQuantity, Math.max(1, nextQuantity)));
  };

  return (
    <div className="mt-8 border-y border-slate-200 py-5">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label
            htmlFor="product-quantity"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Số lượng
          </label>
          <div className="flex h-11 w-36 items-center rounded-lg border border-slate-200 bg-white">
            <button
              type="button"
              disabled={!inStock || quantity <= 1}
              onClick={() => updateQuantity(quantity - 1)}
              className="grid size-10 place-items-center rounded-l-lg text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:text-slate-300"
              aria-label="Giảm số lượng"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <input
              id="product-quantity"
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              disabled={!inStock}
              onChange={(event) => updateQuantity(Number(event.target.value))}
              className="h-10 w-14 border-0 p-0 text-center text-sm font-semibold text-slate-900 focus:ring-0 disabled:bg-white disabled:text-slate-400"
            />
            <button
              type="button"
              disabled={!inStock || quantity >= maxQuantity}
              onClick={() => updateQuantity(quantity + 1)}
              className="grid size-10 place-items-center rounded-r-lg text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:text-slate-300"
              aria-label="Tăng số lượng"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="pt-6">
          <AddToCartButton
            productId={productId}
            productName={productName}
            inStock={inStock}
            stockQuantity={stockQuantity}
            quantity={quantity}
          />
        </div>
      </div>
    </div>
  );
}

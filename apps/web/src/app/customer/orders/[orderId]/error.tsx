"use client";

import { AccountError } from "@/components/customer/account-states";

export default function CustomerOrderDetailError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <AccountError message={error.message} onRetry={reset} />;
}


export const InventoryMovementType = {
  IMPORT: 'IMPORT',
  ADJUSTMENT: 'ADJUSTMENT',
  SALE: 'SALE',
  CANCELLATION: 'CANCELLATION',
  REFUND: 'REFUND',
} as const;

export type InventoryMovementType =
  (typeof InventoryMovementType)[keyof typeof InventoryMovementType];
export const PrismaErrorCode = {
  UniqueConstraint: 'P2002',
} as const;

export type PrismaErrorCodeType = (typeof PrismaErrorCode)[keyof typeof PrismaErrorCode];

export function prismaError(error: unknown, code?: PrismaErrorCodeType) {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false;
  }

  const err = error as { code: unknown };
  return err.code === code;
}

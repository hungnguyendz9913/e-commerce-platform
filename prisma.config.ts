import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "libs/infrastructure/database/prisma/schema.prisma",
  migrations: {
    path: "libs/infrastructure/database/prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
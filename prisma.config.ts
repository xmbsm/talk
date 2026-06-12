import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// 本地开发用 SQLite schema，线上部署用 PostgreSQL schema
const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  schema: isProduction ? "prisma/schema.prisma" : "prisma/schema.sqlite.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});

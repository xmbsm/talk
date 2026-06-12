import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// 默认用 PostgreSQL schema（线上部署），本地开发设置 PRISMA_SCHEMA=prisma/schema.sqlite.prisma
const schema = process.env.PRISMA_SCHEMA || "prisma/schema.prisma";

export default defineConfig({
  schema,
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});

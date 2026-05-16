import { defineConfig } from "drizzle-kit";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const databaseUrl = process.env.DATABASE_URL || "postgresql://localhost/devhub";

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.js"),
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
import "dotenv/config";
import { schema } from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL!, { schema });
console.log("Database connection established with URL:", process.env.DATABASE_URL);

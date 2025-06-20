import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL!);
console.log("Database connection established with URL:", process.env.DATABASE_URL);

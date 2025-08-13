import { db } from "src/infraestructure/drizzle/db";

export async function clearDatabase() {
    // Limpia las tablas de usuarios y campañas
    await db.execute('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    await db.execute('TRUNCATE TABLE campaigns RESTART IDENTITY CASCADE');
} 
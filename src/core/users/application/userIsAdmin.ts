
import type { User } from "$core/users/domain/user";
import { z } from "zod";

const EnvSchema = z.object({
    ADMIN_EMAILS: z.string().default(""),
});

const env = EnvSchema.parse({
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
});

const ADMIN_EMAILS: Set<string> = new Set(
    env.ADMIN_EMAILS
        .split(",")
        .map(e => e.trim().toLowerCase())
        .filter(Boolean)
);


function isAdminEmail(email: string): boolean {
    return ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export function isAdmin(user: User): boolean {
    if (!user?.email || !isAdminEmail(user.email)) {
        return false;
    }
    return true;
}

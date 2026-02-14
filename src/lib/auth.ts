import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";



export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.users,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        },
    }),
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
            },
            rank: {
                type: "string",
                defaultValue: "8flex",
            },
            isVerified: {
                type: "boolean",
                defaultValue: false,
            },
        },
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        },
    },
    emailAndPassword: {
        enabled: false,
    },
    baseURL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [])
    ],
    callbacks: {
        session: async ({ session, user }: { session: any, user: any }) => {
            // Force fetch user to ensure we get custom fields like role
            const [dbUser] = await db.select().from(schema.users).where(eq(schema.users.id, user.id));

            return {
                ...session,
                user: {
                    ...user,
                    role: dbUser?.role || "user",
                    rank: dbUser?.rank || "8flex",
                    isVerified: dbUser?.isVerified || false,
                },
            };
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day (optional, but good practice to update session age)
    },
});

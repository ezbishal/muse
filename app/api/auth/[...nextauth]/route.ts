import { prismaClient } from "@/app/lib/db";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
        })
    ],
    secret: process.env.NEXTAUTH_SECRET ?? "secret",
    
    callbacks: {
        async signIn(params)
        {
            if (!params.user.email || !params.account?.provider)
                return false;

            try
            {
                await prismaClient.user.upsert({
                    where: {
                        email: params.user?.email
                    },
                    create: {
                        email: params.user.email,
                        provider: "Google"
                    },
                    update: {
                        email: params.user.email,
                        provider: "Google"
                    }
                })
            }
            catch (e)
            {
                return false;
            }
            return true;
        }
    }
});

export { handler as GET, handler as POST }

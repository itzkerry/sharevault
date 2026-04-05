import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import {prisma} from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async session({session, token}){
            if(session.user){
                session.user.id = token.sub!
            }
            return session
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    pages:{
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
}
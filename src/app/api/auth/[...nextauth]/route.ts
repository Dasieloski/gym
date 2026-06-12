import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

declare module "next-auth" {
    interface User {
        rol: string;
        username: string;
        nombre: string;
        carnetIdentidad: string;
        telefono: string;
        id: string;
    }
    interface Session {
        user: User;
    }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

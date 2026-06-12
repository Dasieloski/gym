import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "Username" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: Record<"username" | "password", string> | undefined, req: any) {
                console.log("Credenciales recibidas:", credentials);

                if (!credentials) {
                    console.log("No se proporcionaron credenciales.");
                    return null;
                }

                const { username, password } = credentials;

                const userFound = await prisma.usuario.findUnique({
                    where: {
                        username: username,
                    }
                });

                if (!userFound) {
                    console.log("Usuario no encontrado:", username);
                    throw new Error("El nombre de usuario no está registrado.");
                }

                const passwordMatch = await bcrypt.compare(password, userFound.password);
                if (!passwordMatch) {
                    console.log("Contraseña incorrecta para usuario:", username);
                    throw new Error("La contraseña es incorrecta.");
                }

                console.log("Autenticación exitosa para usuario:", username);
                return {
                    id: userFound.id.toString(),
                    username: userFound.username,
                    rol: userFound.rol,
                    nombre: userFound.nombre,
                    carnetIdentidad: userFound.carnetIdentidad,
                    telefono: userFound.telefono,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.rol = user.rol;
                // Agrega otros campos si es necesario
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.rol = token.rol as string;
                // Agrega otros campos si es necesario
            }
            return session;
        }
    },
    pages: {
        signIn: '/login/inicio',
        signOut: '/',
    },
};
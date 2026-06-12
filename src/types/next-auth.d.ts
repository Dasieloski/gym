import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      nombre?: string | null
      username?: string | null
      rol: string
    }
  }
}

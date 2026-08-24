import { Role } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface User {
    role: Role
    state?: string | null
    district?: string | null
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: Role
      state?: string | null
      district?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    state?: string | null
    district?: string | null
  }
}

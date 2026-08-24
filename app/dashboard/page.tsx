import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login")
  }
  const role = (session.user as any).role
  if (role === "ADMIN") redirect("/admin")
  if (role === "LMO" || role === "GATC") redirect("/officer")
  redirect("/owner")
}

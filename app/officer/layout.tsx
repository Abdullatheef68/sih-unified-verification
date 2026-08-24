import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"

export default async function OfficerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  const role = (session.user as any).role
  if (role !== "LMO" && role !== "GATC" && role !== "ADMIN") redirect("/dashboard")
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}

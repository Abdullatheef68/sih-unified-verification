"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Scale, LogOut, LayoutDashboard, Package, FileText, Award, Users, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const ownerLinks = [
  { href: "/owner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/instruments", label: "Instruments", icon: Package },
  { href: "/owner/applications", label: "Applications", icon: FileText },
  { href: "/owner/certificates", label: "Certificates", icon: Award },
]

const officerLinks = [
  { href: "/officer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/officer/applications", label: "Applications", icon: FileText },
]

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/instruments", label: "Instruments", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
]

export function DashboardNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role

  let links = ownerLinks
  if (role === "ADMIN") links = adminLinks
  else if (role === "LMO" || role === "GATC") links = officerLinks

  return (
    <aside className="w-64 border-r bg-white min-h-screen p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
          <Scale className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm">Legal Metrology</p>
          <p className="text-xs text-muted-foreground">{role?.replace("_", " ")}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const active = pathname === link.href || (link.href !== "/owner" && link.href !== "/officer" && link.href !== "/admin" && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t pt-4">
        <p className="text-sm font-medium px-2 truncate">{session?.user?.name}</p>
        <p className="text-xs text-muted-foreground px-2 truncate mb-2">{session?.user?.email}</p>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}

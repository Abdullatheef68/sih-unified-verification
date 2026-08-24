import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FileText, Award, Users, AlertTriangle } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { formatDate } from "@/lib/utils"

export default async function AdminDashboard() {
  const now = new Date()
  const in30Days = new Date()
  in30Days.setDate(in30Days.getDate() + 30)

  const [users, instruments, apps, certs, pending, expiring] = await Promise.all([
    prisma.user.count(),
    prisma.instrument.count(),
    prisma.application.count(),
    prisma.certificate.count({ where: { status: "VALID" } }),
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.certificate.count({ where: { status: "VALID", validUntil: { lte: in30Days, gte: now } } }),
  ])

  const byState = await prisma.instrument.groupBy({
    by: ["state"],
    _count: true,
  })

  const recentApps = await prisma.application.findMany({
    take: 8,
    orderBy: { appliedAt: "desc" },
    include: { instrument: true },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-5">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{users}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Instruments</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{instruments}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Applications</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{apps}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Valid Certs</CardTitle><Award className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{certs}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Expiring Soon</CardTitle><AlertTriangle className="h-4 w-4 text-yellow-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-700">{expiring}</div></CardContent></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Instruments by State</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {byState.map((s) => (
                <div key={s.state} className="flex justify-between text-sm">
                  <span>{s.state}</span>
                  <span className="font-medium">{s._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending: {pending}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentApps.map((app) => (
              <div key={app.id} className="flex justify-between items-center text-sm border-b pb-1">
                <div>
                  <p className="font-medium">{app.instrument.make} {app.instrument.model}</p>
                  <p className="text-muted-foreground text-xs">{app.instrument.state} · {formatDate(app.appliedAt)}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

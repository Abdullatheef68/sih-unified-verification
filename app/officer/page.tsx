import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

export default async function OfficerDashboard() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const [pending, scheduled, completed] = await Promise.all([
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.application.count({ where: { assignedToId: userId, status: "SCHEDULED" } }),
    prisma.verificationResult.count({ where: { officerId: userId } }),
  ])

  const myApps = await prisma.application.findMany({
    where: { OR: [{ assignedToId: userId }, { status: "PENDING" }] },
    include: { instrument: true },
    orderBy: { appliedAt: "desc" },
    take: 10,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Officer Dashboard</h1>
        <Link href="/officer/applications"><Button>View All Applications</Button></Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{pending}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">My Scheduled</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{scheduled}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Completed by Me</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{completed}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Applications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {myApps.map((app) => (
            <div key={app.id} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">{app.instrument.make} {app.instrument.model}</p>
                <p className="text-sm text-muted-foreground">Applied: {formatDate(app.appliedAt)} · {app.instrument.district}, {app.instrument.state}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={app.status} />
                <Link href={`/officer/applications`}><Button size="sm" variant="outline">Open</Button></Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

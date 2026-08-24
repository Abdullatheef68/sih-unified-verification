import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FileText, Award, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"

export default async function OwnerDashboard() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const [instruments, applications, certificates, pendingApps] = await Promise.all([
    prisma.instrument.count({ where: { ownerId: userId } }),
    prisma.application.count({ where: { instrument: { ownerId: userId } } }),
    prisma.certificate.count({ where: { instrument: { ownerId: userId }, status: "VALID" } }),
    prisma.application.findMany({
      where: { instrument: { ownerId: userId }, status: { in: ["PENDING", "SCHEDULED"] } },
      include: { instrument: true },
      orderBy: { appliedAt: "desc" },
      take: 5,
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Owner Dashboard</h1>
        <Link href="/owner/instruments">
          <Button>Register Instrument</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Instruments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instruments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valid Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApps.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApps.length === 0 ? (
            <p className="text-muted-foreground text-sm">No pending applications</p>
          ) : (
            <div className="space-y-3">
              {pendingApps.map((app) => (
                <div key={app.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{app.instrument.make} {app.instrument.model}</p>
                    <p className="text-sm text-muted-foreground">S/N: {app.instrument.serialNumber}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

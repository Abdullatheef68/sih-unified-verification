"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { formatDate } from "@/lib/utils"

export default function OwnerApplicationsPage() {
  const [apps, setApps] = useState<any[]>([])
  useEffect(() => {
    fetch("/api/applications").then((r) => r.json()).then(setApps)
  }, [])
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Applications</h1>
      {apps.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No applications yet</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <Card key={app.id}>
              <CardContent className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{app.instrument?.make} {app.instrument?.model}</p>
                  <p className="text-sm text-muted-foreground">S/N: {app.instrument?.serialNumber} · Applied {formatDate(app.appliedAt)} · {app.type}</p>
                  {app.certificate && <p className="text-sm text-green-700">Certificate: {app.certificate.certificateNumber}</p>}
                </div>
                <StatusBadge status={app.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

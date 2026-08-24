"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { formatDate } from "@/lib/utils"
import { Download } from "lucide-react"

export default function OwnerCertificatesPage() {
  const [apps, setApps] = useState<any[]>([])
  useEffect(() => {
    fetch("/api/applications").then((r) => r.json()).then((data) => {
      setApps(data.filter((a: any) => a.certificate))
    })
  }, [])
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Certificates</h1>
      {apps.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No certificates yet</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <Card key={app.id}>
              <CardContent className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-mono font-semibold">{app.certificate.certificateNumber}</p>
                  <p className="text-sm">{app.instrument?.make} {app.instrument?.model} · S/N {app.instrument?.serialNumber}</p>
                  <p className="text-sm text-muted-foreground">Issued {formatDate(app.certificate.issuedAt)} · Valid until {formatDate(app.certificate.validUntil)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={app.certificate.status} />
                  <a href={`/api/certificates/${encodeURIComponent(app.certificate.certificateNumber)}`} target="_blank">
                    <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" />PDF</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

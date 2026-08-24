"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export default function OfficerApplicationsPage() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [observations, setObservations] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/applications")
    if (res.ok) setApps(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function schedule(id: string) {
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "schedule", scheduledDate: new Date().toISOString() }),
    })
    if (res.ok) { toast.success("Scheduled"); load() }
    else toast.error("Failed")
  }

  async function verify(id: string, result: "PASS" | "FAIL") {
    setSubmitting(true)
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", overallResult: result, observations, testResults: { visual: "OK", accuracy: "Within limits" } }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success(result === "PASS" ? `Passed! Certificate: ${data.certificate?.certificateNumber}` : "Marked as FAIL")
      setSelected(null)
      setObservations("")
      load()
    } else toast.error(data.error || "Failed")
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Verification Applications</h1>
      {loading ? <p>Loading...</p> : (
        <div className="grid gap-4">
          {apps.map((app) => (
            <Card key={app.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{app.instrument.make} {app.instrument.model}</p>
                    <p className="text-sm text-muted-foreground">S/N: {app.instrument.serialNumber} · {app.instrument.type.replace(/_/g, " ")}</p>
                    <p className="text-sm text-muted-foreground">Owner: {app.instrument.owner?.name} · {app.instrument.location}, {app.instrument.district}</p>
                    <p className="text-sm text-muted-foreground">Applied: {formatDate(app.appliedAt)} · Type: {app.type}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="mt-3 flex gap-2">
                  {app.status === "PENDING" && (
                    <Button size="sm" onClick={() => schedule(app.id)}>Assign & Schedule</Button>
                  )}
                  {(app.status === "SCHEDULED" || app.status === "PENDING") && (
                    <Button size="sm" variant="outline" onClick={() => setSelected(app)}>Record Result</Button>
                  )}
                  {app.certificate && (
                    <span className="text-sm text-green-700 font-medium self-center">Cert: {app.certificate.certificateNumber}</span>
                  )}
                </div>
                {selected?.id === app.id && (
                  <div className="mt-4 p-4 border rounded-md bg-muted/50 space-y-3">
                    <div className="space-y-2">
                      <Label>Observations</Label>
                      <Input value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Verification notes..." />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" disabled={submitting} onClick={() => verify(app.id, "PASS")}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Pass & Issue Certificate
                      </Button>
                      <Button size="sm" variant="destructive" disabled={submitting} onClick={() => verify(app.id, "FAIL")}>Fail</Button>
                      <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

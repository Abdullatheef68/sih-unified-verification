"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

const TYPES = [
  { value: "DIGITAL_WEIGHING_SCALE", label: "Digital Weighing Scale" },
  { value: "WEIGHBRIDGE", label: "Weighbridge" },
  { value: "FUEL_DISPENSER", label: "Fuel Dispenser" },
  { value: "WATER_METER", label: "Water Meter" },
  { value: "MEASURING_TAPE", label: "Measuring Tape" },
  { value: "OTHERS", label: "Others" },
]
const STATES = ["Tamil Nadu", "Karnataka", "Maharashtra", "Uttar Pradesh", "Delhi"]

export default function InstrumentsPage() {
  const [instruments, setInstruments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    type: "DIGITAL_WEIGHING_SCALE", make: "", model: "", serialNumber: "", capacity: "", accuracyClass: "", location: "", state: "Tamil Nadu", district: "",
  })

  async function load() {
    setLoading(true)
    const res = await fetch("/api/instruments")
    if (res.ok) setInstruments(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/instruments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) toast.error(data.error)
      else { toast.success("Instrument registered"); setShowForm(false); load() }
    } catch { toast.error("Failed") } finally { setSubmitting(false) }
  }

  async function applyVerification(instrumentId: string) {
    const res = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ instrumentId, type: "INITIAL" }) })
    const data = await res.json()
    if (!res.ok) toast.error(data.error)
    else { toast.success("Verification application submitted"); load() }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Instruments</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />Add Instrument</Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Register New Instrument</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Make</Label><Input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Model</Label><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Serial Number</Label><Input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Capacity</Label><Input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 100 kg" /></div>
              <div className="space-y-2"><Label>Accuracy Class</Label><Input value={form.accuracyClass} onChange={(e) => setForm({ ...form, accuracyClass: e.target.value })} placeholder="e.g. Class III" /></div>
              <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></div>
              <div className="space-y-2"><Label>State</Label>
                <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>District</Label><Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required /></div>
              <div className="col-span-2"><Button type="submit" disabled={submitting}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Register</Button></div>
            </form>
          </CardContent>
        </Card>
      )}
      {loading ? <p>Loading...</p> : instruments.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No instruments registered yet</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {instruments.map((inst) => (
            <Card key={inst.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{inst.make} {inst.model}</p>
                  <p className="text-sm text-muted-foreground">{TYPES.find((t) => t.value === inst.type)?.label} · S/N: {inst.serialNumber}</p>
                  <p className="text-sm text-muted-foreground">{inst.location}, {inst.district}, {inst.state}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={inst.status} />
                  {inst.status === "PENDING_VERIFICATION" && (
                    <Button size="sm" onClick={() => applyVerification(inst.id)}>Apply Verification</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Scale, Search, Shield, QrCode } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default function VerifyPage() {
  const [certId, setCertId] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function verify() {
    if (!certId.trim()) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch(`/api/verify?id=${encodeURIComponent(certId.trim())}`)
      const data = await res.json()
      if (!res.ok) setError(data.error || "Not found")
      else setResult(data)
    } catch {
      setError("Verification failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-primary">Legal Metrology</h1>
              <p className="text-xs text-muted-foreground">Certificate Verification</p>
            </div>
          </Link>
          <Link href="/login"><Button variant="outline">Login</Button></Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mb-4">
            <Shield className="h-4 w-4" />
            Official Public Verification Portal
          </div>
          <h2 className="text-3xl font-bold mb-2">Verify Digital Certificate</h2>
          <p className="text-muted-foreground">Enter Certificate ID or scan QR code to check authenticity and validity</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Certificate Lookup</CardTitle>
            <CardDescription>Format: LM/YYYY/XXXXXX</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. LM/2026/123456"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verify()}
              />
              <Button onClick={verify} disabled={loading}>{loading ? "Checking..." : "Verify"}</Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <QrCode className="h-4 w-4" />
              QR Scanner simulation: paste certificate number from QR data
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <Card className="mt-6 border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Certificate Details</CardTitle>
                <StatusBadge status={result.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Certificate No.</p><p className="font-mono font-semibold">{result.certificateNumber}</p></div>
                <div><p className="text-muted-foreground">Issued On</p><p>{formatDate(result.issuedAt)}</p></div>
                <div><p className="text-muted-foreground">Valid Until</p><p className={result.status === "EXPIRED" ? "text-destructive font-semibold" : ""}>{formatDate(result.validUntil)}</p></div>
                <div><p className="text-muted-foreground">Result</p><StatusBadge status={result.overallResult || "PASS"} /></div>
              </div>
              <hr />
              <div>
                <p className="text-muted-foreground text-sm">Instrument</p>
                <p className="font-medium">{result.instrument?.make} {result.instrument?.model}</p>
                <p className="text-sm">S/N: {result.instrument?.serialNumber} · {result.instrument?.type?.replace(/_/g, " ")}</p>
                <p className="text-sm text-muted-foreground">{result.instrument?.location}, {result.instrument?.district}, {result.instrument?.state}</p>
              </div>
              {result.officer && (
                <div>
                  <p className="text-muted-foreground text-sm">Verified By</p>
                  <p className="font-medium">{result.officer.name}</p>
                </div>
              )}
              {result.status === "VALID" && (
                <div className="bg-green-50 text-green-800 p-3 rounded-md text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  This certificate is valid and authentic as of {new Date().toLocaleString("en-IN")}
                </div>
              )}
              {result.status === "EXPIRED" && (
                <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm font-medium">This certificate has expired. Please apply for re-verification.</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

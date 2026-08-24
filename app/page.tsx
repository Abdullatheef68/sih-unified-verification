import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, Shield, QrCode, FileCheck, Users, Building2 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-primary">Legal Metrology</h1>
              <p className="text-xs text-muted-foreground">Unified Verification System</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/verify">
              <Button variant="outline">Verify Certificate</Button>
            </Link>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mb-6">
          <Shield className="h-4 w-4" />
          Smart India Hackathon 2026 · Problem SIH 26036
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Unified Online Verification &<br />
          <span className="text-primary">Digital Certification System</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          For Weighing and Measuring Instruments under the Legal Metrology Act.
          Register instruments, apply for verification, get digital certificates with QR codes.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/register">
            <Button size="lg">Register as Owner</Button>
          </Link>
          <Link href="/verify">
            <Button size="lg" variant="outline">
              <QrCode className="mr-2 h-5 w-5" />
              Verify Certificate
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <FileCheck className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Digital Certificates</CardTitle>
              <CardDescription>
                Instant PDF certificates with unique ID and QR code for public verification
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Dedicated dashboards for Instrument Owners, LMOs, GATCs and Administrators
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Building2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Pan-India Coverage</CardTitle>
              <CardDescription>
                Cross-state instrument registry and verification tracking with district-level filters
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Department of Consumer Affairs · Legal Metrology Division</p>
        <p className="mt-1">Built for Smart India Hackathon 2026</p>
      </footer>
    </div>
  )
}

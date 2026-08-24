import { Badge } from "@/components/ui/badge"

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "info" | "outline" }> = {
  PENDING: { label: "Pending", variant: "warning" },
  SCHEDULED: { label: "Scheduled", variant: "info" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  COMPLETED: { label: "Completed", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "secondary" },
  ACTIVE: { label: "Active", variant: "success" },
  PENDING_VERIFICATION: { label: "Pending Verification", variant: "warning" },
  VERIFIED: { label: "Verified", variant: "success" },
  EXPIRED: { label: "Expired", variant: "destructive" },
  VALID: { label: "Valid", variant: "success" },
  REVOKED: { label: "Revoked", variant: "destructive" },
  PASS: { label: "Pass", variant: "success" },
  FAIL: { label: "Fail", variant: "destructive" },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusMap[status] || { label: status, variant: "outline" as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

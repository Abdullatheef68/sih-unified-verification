import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json(
      { error: "Certificate ID required" },
      { status: 400 },
    );

  // Auto-expire check
  const cert = await prisma.certificate.findUnique({
    where: { certificateNumber: id },
    include: {
      instrument: true,
      application: {
        include: {
          verificationResult: {
            include: { officer: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!cert)
    return NextResponse.json(
      { error: "Certificate not found" },
      { status: 404 },
    );

  // Auto update expired
  if (cert.status === "VALID" && new Date(cert.validUntil) < new Date()) {
    await prisma.certificate.update({
      where: { id: cert.id },
      data: { status: "EXPIRED" },
    });
    await prisma.instrument.update({
      where: { id: cert.instrumentId },
      data: { status: "EXPIRED" },
    });
    cert.status = "EXPIRED";
  }

  return NextResponse.json({
    certificateNumber: cert.certificateNumber,
    status: cert.status,
    issuedAt: cert.issuedAt,
    validUntil: cert.validUntil,
    instrument: cert.instrument,
    overallResult: cert.application?.verificationResult?.overallResult,
    officer: cert.application?.verificationResult?.officer,
  });
}

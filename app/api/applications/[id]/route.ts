import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCertificateNumber } from "@/lib/utils";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const body = await req.json();
  const { action } = body;

  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: { instrument: true },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Schedule / Assign
  if (action === "schedule") {
    if (role !== "ADMIN" && role !== "LMO")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { assignedToId, scheduledDate } = body;
    const updated = await prisma.application.update({
      where: { id: params.id },
      data: {
        status: "SCHEDULED",
        assignedToId: assignedToId || userId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
      },
    });
    return NextResponse.json(updated);
  }

  // Record verification result
  if (action === "verify") {
    if (role !== "LMO" && role !== "GATC" && role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { overallResult, observations, testResults } = body;
    if (!["PASS", "FAIL"].includes(overallResult))
      return NextResponse.json({ error: "Invalid result" }, { status: 400 });

    const result = await prisma.verificationResult.create({
      data: {
        applicationId: params.id,
        officerId: userId,
        overallResult,
        observations,
        testResults: testResults || {},
        photos: "[]",
      },
    });

    await prisma.application.update({
      where: { id: params.id },
      data: { status: "COMPLETED" },
    });

    if (overallResult === "PASS") {
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + 1);
      const certNumber = generateCertificateNumber();
      const qrPayload = JSON.stringify({
        certificateNumber: certNumber,
        instrumentId: app.instrumentId,
        validUntil: validUntil.toISOString(),
      });
      const qrData = await QRCode.toDataURL(qrPayload);

      const cert = await prisma.certificate.create({
        data: {
          certificateNumber: certNumber,
          applicationId: params.id,
          instrumentId: app.instrumentId,
          validUntil,
          status: "VALID",
          qrData,
        },
      });
      await prisma.instrument.update({
        where: { id: app.instrumentId },
        data: { status: "VERIFIED" },
      });
      await prisma.auditLog.create({
        data: {
          userId,
          action: "CERTIFICATE_ISSUED",
          entityType: "Certificate",
          entityId: cert.id,
          details: { certificateNumber: certNumber },
        },
      });
      return NextResponse.json({ result, certificate: cert });
    } else {
      await prisma.instrument.update({
        where: { id: app.instrumentId },
        data: { status: "REJECTED" },
      });
    }
    return NextResponse.json({ result });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

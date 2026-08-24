import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  let where: any = {};
  if (role === "INSTRUMENT_OWNER") where.instrument = { ownerId: userId };
  else if (role === "LMO" || role === "GATC")
    where.OR = [{ assignedToId: userId }, { status: "PENDING" }];
  if (status) where.status = status;
  const apps = await prisma.application.findMany({
    where,
    include: {
      instrument: {
        include: {
          owner: { select: { name: true, email: true, phone: true } },
        },
      },
      assignedTo: { select: { name: true, email: true } },
      verificationResult: true,
      certificate: true,
    },
    orderBy: { appliedAt: "desc" },
  });
  return NextResponse.json(apps);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "INSTRUMENT_OWNER")
    return NextResponse.json(
      { error: "Only owners can apply" },
      { status: 403 },
    );
  try {
    const body = await req.json();
    const { instrumentId, type } = z
      .object({
        instrumentId: z.string(),
        type: z.enum(["INITIAL", "REVERIFICATION"]),
      })
      .parse(body);
    const instrument = await prisma.instrument.findFirst({
      where: { id: instrumentId, ownerId: (session.user as any).id },
    });
    if (!instrument)
      return NextResponse.json(
        { error: "Instrument not found" },
        { status: 404 },
      );
    const existing = await prisma.application.findFirst({
      where: {
        instrumentId,
        status: { in: ["PENDING", "SCHEDULED", "IN_PROGRESS"] },
      },
    });
    if (existing)
      return NextResponse.json(
        { error: "Active application already exists" },
        { status: 400 },
      );
    const app = await prisma.application.create({
      data: { instrumentId, type, status: "PENDING" },
    });
    await prisma.instrument.update({
      where: { id: instrumentId },
      data: { status: "PENDING_VERIFICATION" },
    });
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "APPLICATION_SUBMITTED",
        entityType: "Application",
        entityId: app.id,
      },
    });
    return NextResponse.json(app);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 },
    );
  }
}

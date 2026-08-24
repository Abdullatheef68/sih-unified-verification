import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  type: z.enum([
    "DIGITAL_WEIGHING_SCALE",
    "WEIGHBRIDGE",
    "FUEL_DISPENSER",
    "WATER_METER",
    "MEASURING_TAPE",
    "OTHERS",
  ]),
  make: z.string().min(1),
  model: z.string().min(1),
  serialNumber: z.string().min(1),
  capacity: z.string().optional(),
  accuracyClass: z.string().optional(),
  location: z.string().min(1),
  state: z.string().min(1),
  district: z.string().min(1),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  let instruments;
  if (role === "INSTRUMENT_OWNER") {
    instruments = await prisma.instrument.findMany({
      where: { ownerId: userId },
      include: { certificates: { where: { status: "VALID" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
  } else {
    instruments = await prisma.instrument.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        certificates: { where: { status: "VALID" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }
  return NextResponse.json(instruments);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "INSTRUMENT_OWNER") {
    return NextResponse.json(
      { error: "Only owners can register instruments" },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const instrument = await prisma.instrument.create({
      data: {
        ...data,
        ownerId: (session.user as any).id,
        status: "PENDING_VERIFICATION",
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "INSTRUMENT_REGISTERED",
        entityType: "Instrument",
        entityId: instrument.id,
      },
    });
    return NextResponse.json(instrument);
  } catch (e: any) {
    if (e.code === "P2002")
      return NextResponse.json(
        { error: "Serial number already exists for this make" },
        { status: 400 },
      );
    if (e.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    console.error(e);
    return NextResponse.json(
      { error: "Failed to register instrument" },
      { status: 500 },
    );
  }
}

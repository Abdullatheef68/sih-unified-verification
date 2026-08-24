import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(["INSTRUMENT_OWNER", "LMO", "GATC", "ADMIN"]),
  state: z.string().optional(),
  district: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    // Only allow ADMIN via seed; block self-registration as ADMIN
    if (data.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot register as Admin" },
        { status: 403 },
      );
    }

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        role: data.role as Role,
        phone: data.phone,
        state: data.state,
        district: data.district,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTERED",
        entityType: "User",
        entityId: user.id,
        details: { role: user.role },
      },
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

import { PrismaClient, Role, InstrumentType, ApplicationStatus, OverallResult, CertificateStatus } from "@prisma/client"
import bcrypt from "bcryptjs"
import QRCode from "qrcode"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")
  await prisma.auditLog.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.verificationResult.deleteMany()
  await prisma.application.deleteMany()
  await prisma.instrument.deleteMany()
  await prisma.user.deleteMany()

  const hash = await bcrypt.hash("password123", 12)

  // Admins
  const admins = await Promise.all([
    prisma.user.create({ data: { name: "System Admin", email: "admin@lm.gov.in", password: hash, role: "ADMIN", state: "Delhi", district: "New Delhi", phone: "9876543210" } }),
    prisma.user.create({ data: { name: "National Admin", email: "admin2@lm.gov.in", password: hash, role: "ADMIN", state: "Delhi", district: "New Delhi" } }),
    prisma.user.create({ data: { name: "State Coordinator", email: "admin3@lm.gov.in", password: hash, role: "ADMIN", state: "Maharashtra", district: "Mumbai" } }),
  ])

  // LMOs / GATCs
  const officers = await Promise.all([
    prisma.user.create({ data: { name: "R. Kumar (LMO TN)", email: "lmo.tn@lm.gov.in", password: hash, role: "LMO", state: "Tamil Nadu", district: "Chennai", phone: "9876500001" } }),
    prisma.user.create({ data: { name: "S. Reddy (LMO KA)", email: "lmo.ka@lm.gov.in", password: hash, role: "LMO", state: "Karnataka", district: "Bengaluru" } }),
    prisma.user.create({ data: { name: "A. Patil (LMO MH)", email: "lmo.mh@lm.gov.in", password: hash, role: "LMO", state: "Maharashtra", district: "Pune" } }),
    prisma.user.create({ data: { name: "V. Singh (LMO UP)", email: "lmo.up@lm.gov.in", password: hash, role: "LMO", state: "Uttar Pradesh", district: "Lucknow" } }),
    prisma.user.create({ data: { name: "P. Sharma (LMO DL)", email: "lmo.dl@lm.gov.in", password: hash, role: "LMO", state: "Delhi", district: "South Delhi" } }),
    prisma.user.create({ data: { name: "GATC Chennai", email: "gatc.chennai@lm.gov.in", password: hash, role: "GATC", state: "Tamil Nadu", district: "Chennai" } }),
    prisma.user.create({ data: { name: "GATC Mumbai", email: "gatc.mumbai@lm.gov.in", password: hash, role: "GATC", state: "Maharashtra", district: "Mumbai" } }),
    prisma.user.create({ data: { name: "GATC Bengaluru", email: "gatc.blr@lm.gov.in", password: hash, role: "GATC", state: "Karnataka", district: "Bengaluru" } }),
  ])

  // Owners
  const owners = []
  const states = ["Tamil Nadu", "Karnataka", "Maharashtra", "Uttar Pradesh", "Delhi"]
  const districts: Record<string, string[]> = {
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubli"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida"],
    "Delhi": ["New Delhi", "South Delhi", "East Delhi"],
  }
  for (let i = 1; i <= 15; i++) {
    const st = states[i % states.length]
    const dist = districts[st][i % 3]
    owners.push(await prisma.user.create({
      data: {
        name: `Owner ${i}`,
        email: `owner${i}@example.com`,
        password: hash,
        role: "INSTRUMENT_OWNER",
        state: st,
        district: dist,
        phone: `98${String(i).padStart(8, "0")}`,
      },
    }))
  }

  const types: InstrumentType[] = ["DIGITAL_WEIGHING_SCALE", "WEIGHBRIDGE", "FUEL_DISPENSER", "WATER_METER", "MEASURING_TAPE", "OTHERS"]
  const makes = ["Avery", "Essae", "Mettler", "Fairbanks", "Ishida", "CAS", "Rice Lake", "Ohaus"]
  const instruments = []
  for (let i = 0; i < 45; i++) {
    const owner = owners[i % owners.length]
    const type = types[i % types.length]
    instruments.push(await prisma.instrument.create({
      data: {
        ownerId: owner.id,
        type,
        make: makes[i % makes.length],
        model: `Model-${100 + i}`,
        serialNumber: `SN${2026}${String(i).padStart(5, "0")}`,
        capacity: type === "WEIGHBRIDGE" ? "50 ton" : type === "FUEL_DISPENSER" ? "—" : "100 kg",
        accuracyClass: "Class III",
        location: `${owner.district} Market`,
        state: owner.state!,
        district: owner.district!,
        status: i < 20 ? "VERIFIED" : i < 30 ? "PENDING_VERIFICATION" : "ACTIVE",
      },
    }))
  }

  // Applications in various stages
  let certCount = 0
  for (let i = 0; i < 25; i++) {
    const inst = instruments[i]
    const officer = officers[i % officers.length]
    let status: ApplicationStatus = "PENDING"
    if (i < 15) status = "COMPLETED"
    else if (i < 20) status = "SCHEDULED"
    else status = "PENDING"

    const app = await prisma.application.create({
      data: {
        instrumentId: inst.id,
        type: i % 5 === 0 ? "REVERIFICATION" : "INITIAL",
        status,
        assignedToId: status !== "PENDING" ? officer.id : null,
        scheduledDate: status !== "PENDING" ? new Date(Date.now() - (25 - i) * 86400000) : null,
        appliedAt: new Date(Date.now() - (30 - i) * 86400000),
      },
    })

    if (status === "COMPLETED") {
      const pass = i < 18 // most pass
      await prisma.verificationResult.create({
        data: {
          applicationId: app.id,
          officerId: officer.id,
          overallResult: pass ? "PASS" : "FAIL",
          observations: pass ? "All parameters within permissible limits." : "Accuracy drift beyond limits.",
          testResults: { visual: "OK", accuracy: pass ? "Within limits" : "Failed" },
          photos: "[]",
          verifiedAt: new Date(Date.now() - (20 - i) * 86400000),
        },
      })
      if (pass) {
        const validUntil = new Date()
        validUntil.setFullYear(validUntil.getFullYear() + 1)
        if (i < 3) validUntil.setMonth(validUntil.getMonth() - 13) // expired ones
        const certNumber = `LM/2026/${100000 + ++certCount}`
        const qrPayload = JSON.stringify({ certificateNumber: certNumber, instrumentId: inst.id, validUntil: validUntil.toISOString() })
        const qrData = await QRCode.toDataURL(qrPayload)
        await prisma.certificate.create({
          data: {
            certificateNumber: certNumber,
            applicationId: app.id,
            instrumentId: inst.id,
            issuedAt: new Date(Date.now() - (20 - i) * 86400000),
            validUntil,
            status: validUntil < new Date() ? "EXPIRED" : "VALID",
            qrData,
          },
        })
        await prisma.instrument.update({ where: { id: inst.id }, data: { status: validUntil < new Date() ? "EXPIRED" : "VERIFIED" } })
      }
    }
  }

  console.log("Seed complete!")
  console.log("Admins:", admins.length, "Officers:", officers.length, "Owners:", owners.length, "Instruments:", instruments.length)
  console.log("Login with any email above, password: password123")
  console.log("Sample certs: LM/2026/100001 etc.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

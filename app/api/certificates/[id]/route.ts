import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const cert = await prisma.certificate.findFirst({
    where: {
      OR: [{ id: params.id }, { certificateNumber: params.id }],
    },
    include: {
      instrument: { include: { owner: true } },
      application: { include: { verificationResult: { include: { officer: true } } } },
    },
  })
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const { width, height } = page.getSize()

  page.drawText("GOVERNMENT OF INDIA", { x: 180, y: height - 60, size: 14, font: bold, color: rgb(0.1, 0.2, 0.5) })
  page.drawText("Department of Consumer Affairs", { x: 170, y: height - 80, size: 11, font })
  page.drawText("Legal Metrology – Digital Certificate of Verification", { x: 100, y: height - 110, size: 14, font: bold })
  page.drawText(`Certificate No: ${cert.certificateNumber}`, { x: 50, y: height - 160, size: 12, font: bold })
  page.drawText(`Status: ${cert.status}`, { x: 50, y: height - 180, size: 11, font })
  page.drawText(`Issued: ${cert.issuedAt.toLocaleDateString("en-IN")}`, { x: 50, y: height - 200, size: 11, font })
  page.drawText(`Valid Until: ${cert.validUntil.toLocaleDateString("en-IN")}`, { x: 50, y: height - 220, size: 11, font })
  page.drawText("Instrument Details", { x: 50, y: height - 260, size: 12, font: bold })
  page.drawText(`Make/Model: ${cert.instrument.make} ${cert.instrument.model}`, { x: 50, y: height - 280, size: 11, font })
  page.drawText(`Serial No: ${cert.instrument.serialNumber}`, { x: 50, y: height - 300, size: 11, font })
  page.drawText(`Type: ${cert.instrument.type.replace(/_/g, " ")}`, { x: 50, y: height - 320, size: 11, font })
  page.drawText(`Location: ${cert.instrument.location}, ${cert.instrument.district}, ${cert.instrument.state}`, { x: 50, y: height - 340, size: 11, font })
  page.drawText(`Owner: ${cert.instrument.owner.name}`, { x: 50, y: height - 360, size: 11, font })
  if (cert.application?.verificationResult) {
    page.drawText(`Verified By: ${cert.application.verificationResult.officer.name}`, { x: 50, y: height - 400, size: 11, font })
    page.drawText(`Result: ${cert.application.verificationResult.overallResult}`, { x: 50, y: height - 420, size: 11, font })
  }
  page.drawText("Scan QR on public portal /verify to authenticate this certificate.", { x: 50, y: 80, size: 9, font, color: rgb(0.4, 0.4, 0.4) })
  page.drawText("This is a digitally generated certificate under the Legal Metrology Act.", { x: 50, y: 60, size: 9, font, color: rgb(0.4, 0.4, 0.4) })

  if (cert.qrData?.startsWith("data:image")) {
    try {
      const base64 = cert.qrData.split(",")[1]
      const qrImage = await pdfDoc.embedPng(Buffer.from(base64, "base64"))
      page.drawImage(qrImage, { x: width - 180, y: height - 280, width: 120, height: 120 })
    } catch {}
  }

  const pdfBytes = await pdfDoc.save()
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${cert.certificateNumber.replace(/\//g, "-")}.pdf"`,
    },
  })
}

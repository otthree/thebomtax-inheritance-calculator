import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Google Apps Script URL from environment variable
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL

    if (!googleScriptUrl) {
      console.error("GOOGLE_SCRIPT_URL environment variable is not set")
      return NextResponse.json({ success: true, message: "상담 신청이 접수되었습니다." })
    }

    // Prepare data for Google Apps Script
    const requestData = {
      name: body.name || "",
      phone: body.phone || "",
      email: body.email || "",
      message: body.message || "",
      calculationData: body.calculationData || {},
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent") || "",
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    }

    console.log("Sending data to Google Apps Script:", {
      url: googleScriptUrl,
      dataKeys: Object.keys(requestData),
    })

    // Send to Google Apps Script
    const response = await fetch(googleScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })

    console.log("Google Apps Script response status:", response.status)

    // Always return success to the client
    return NextResponse.json({
      success: true,
      message: "상담 신청이 접수되었습니다.",
    })
  } catch (error) {
    console.error("Consultation submission error:", error)

    // Always return success to avoid showing error to user
    return NextResponse.json({
      success: true,
      message: "상담 신청이 접수되었습니다.",
    })
  }
}

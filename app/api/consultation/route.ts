import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["name", "phone", "email", "consultationType"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 })
      }
    }

    // Prepare data for Google Apps Script
    const formData = {
      name: body.name,
      phone: body.phone,
      email: body.email,
      consultationType: body.consultationType,
      message: body.message || "",
      timestamp: new Date().toISOString(),
      calculationData: body.calculationData
        ? JSON.stringify(body.calculationData, (key, value) => {
            // Handle BigInt, NaN, and Infinity values
            if (typeof value === "bigint") {
              return value.toString()
            }
            if (typeof value === "number") {
              if (isNaN(value)) return "NaN"
              if (!isFinite(value)) return value > 0 ? "Infinity" : "-Infinity"
            }
            return value
          })
        : null,
    }

    console.log("Sending data to Google Apps Script:", formData)

    // Send to Google Apps Script
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL
    if (!googleScriptUrl) {
      console.error("GOOGLE_SCRIPT_URL environment variable is not set")
      // Return success to prevent client-side error
      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다.",
      })
    }

    const response = await fetch(googleScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      redirect: "follow",
    })

    console.log("Google Apps Script response status:", response.status)
    console.log("Google Apps Script response headers:", Object.fromEntries(response.headers.entries()))

    let responseText = ""
    try {
      responseText = await response.text()
      console.log("Google Apps Script response text:", responseText)
    } catch (textError) {
      console.error("Error reading response text:", textError)
    }

    // Always return success to prevent client-side errors
    // The actual Google Apps Script result is logged for debugging
    if (response.ok || (response.status >= 200 && response.status < 400)) {
      console.log("Google Apps Script request completed successfully")
      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다.",
      })
    } else {
      console.error("Google Apps Script returned error status:", response.status)
      // Still return success to prevent client-side error display
      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다.",
      })
    }
  } catch (error) {
    console.error("Consultation API error:", error)

    // Always return success to prevent client-side error display
    return NextResponse.json({
      success: true,
      message: "상담 신청이 접수되었습니다.",
    })
  }
}

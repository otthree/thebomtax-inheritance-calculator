export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"

const SLACK_CONSULTATION_WEBHOOK_URL = process.env.SLACK_CONSULTATION_WEBHOOK_URL

const fail = (message: string) => NextResponse.json({ success: false, message }, { status: 400 })

// ----- 안전한 JSON 변환 (BigInt·NaN·Infinity 방지) -----
const safeStringify = (value: unknown) =>
  JSON.stringify(value, (_, v) => {
    if (typeof v === "bigint") return v.toString()
    if (Number.isNaN(v) || v === Number.POSITIVE_INFINITY || v === Number.NEGATIVE_INFINITY) return null
    return v
  })

export async function POST(req: NextRequest) {
  if (!SLACK_CONSULTATION_WEBHOOK_URL) {
    return fail("슬랙 웹훅 URL이 설정되지 않았습니다.")
  }

  const { name, phone, message, calculationData } = await req.json()

  if (!name) return fail("이름을 입력해주세요.")
  if (!phone) return fail("연락처를 입력해주세요.")
  if (!message) return fail("문의 내용을 입력해주세요.")
  if (!calculationData) return fail("견적 데이터를 입력해주세요.")

  try {
    const payload = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      message: String(message).trim(),
      calculationData,
      timestamp: new Date().toISOString(),
    }

    const res = await fetch(SLACK_CONSULTATION_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: safeStringify(payload),
    })

    if (!res.ok) {
      console.error("Slack webhook failed", res)
      return fail("문의 전송에 실패했습니다.")
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("문의 전송 중 오류 발생", e)
    return fail("문의 전송 중 오류가 발생했습니다.")
  }
}

import { NextResponse, type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 일단 로컬에서 성공 응답만 반환 (구글 시트 연동 전)
    console.log("상담 신청 데이터:", body)

    return NextResponse.json({
      success: true,
      message: "상담 신청이 접수되었습니다.",
    })
  } catch (error) {
    console.error("API 오류:", error)
    return NextResponse.json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    })
  }
}

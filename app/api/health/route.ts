import { NextResponse } from "next/server"

export async function GET() {
  console.log("🏥 Health check executado")

  return NextResponse.json({
    status: "OK",
    message: "API está funcionando",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
}

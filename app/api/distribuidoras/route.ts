import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("🔍 [API] Buscando distribuidoras únicas...")
    await prisma.$connect()

    const distribuidoras = await prisma.usina.findMany({
      distinct: ["distribuidora"],
      select: {
        distribuidora: true,
      },
      where: {
        distribuidora: {
          not: null,
        },
      },
      orderBy: {
        distribuidora: "asc",
      },
    })

    const uniqueDistribuidoras = distribuidoras
      .map((d) => d.distribuidora)
      .filter((d): d is string => d !== null && d !== "")

    console.log(`✅ [API] Encontradas ${uniqueDistribuidoras.length} distribuidoras únicas.`)
    return NextResponse.json(uniqueDistribuidoras)
  } catch (error) {
    console.error("❌ [API] Erro ao buscar distribuidoras:", error)
    return NextResponse.json(
      { error: "Erro ao buscar distribuidoras", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}

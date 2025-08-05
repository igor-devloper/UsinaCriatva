import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("🔍 [API] Buscando consórcios únicos...")
    await prisma.$connect()

    const consorcios = await prisma.usina.findMany({
      distinct: ["consorcio"],
      select: {
        consorcio: true,
      },
      where: {
        consorcio: {
          not: null,
        },
      },
      orderBy: {
        consorcio: "asc",
      },
    })

    const uniqueConsorcios = consorcios.map((c) => c.consorcio).filter((c): c is string => c !== null && c !== "")

    console.log(`✅ [API] Encontrados ${uniqueConsorcios.length} consórcios únicos.`)
    return NextResponse.json(uniqueConsorcios)
  } catch (error) {
    console.error("❌ [API] Erro ao buscar consórcios:", error)
    return NextResponse.json(
      { error: "Erro ao buscar consórcios", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}

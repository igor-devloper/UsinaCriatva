import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    console.log("🔍 Buscando gerações...")

    const { searchParams } = new URL(request.url)
    const usinaId = searchParams.get("usinaId")
    const dataInicio = searchParams.get("dataInicio")
    const dataFim = searchParams.get("dataFim")

    console.log("Parâmetros:", { usinaId, dataInicio, dataFim })

    const where: any = {}

    if (usinaId) {
      where.usinaId = Number.parseInt(usinaId)
    }

    if (dataInicio && dataFim) {
      where.data = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      }
    }

    const geracoes = await prisma.geracaoDiaria.findMany({
      where,
      include: {
        usina: true,
      },
      orderBy: {
        data: "asc",
      },
    })

    console.log(`✅ Encontradas ${geracoes.length} gerações`)
    return NextResponse.json(geracoes)
  } catch (error) {
    console.error("❌ Erro ao buscar gerações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("➕ Criando nova geração...")

    const body = await request.json()
    const { usinaId, data, energiaKwh, ocorrencia } = body

    console.log("Dados recebidos:", { usinaId, data, energiaKwh, ocorrencia })

    // Validações
    if (!usinaId || !data || !energiaKwh || !ocorrencia) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    // Verificar se a usina existe
    const usinaExiste = await prisma.usina.findUnique({
      where: { id: Number.parseInt(usinaId) },
    })

    if (!usinaExiste) {
      return NextResponse.json({ error: "Usina não encontrada" }, { status: 404 })
    }

    const geracao = await prisma.geracaoDiaria.create({
      data: {
        usinaId: Number.parseInt(usinaId),
        data: new Date(data),
        energiaKwh: Number.parseFloat(energiaKwh),
        ocorrencia: ocorrencia,
        clima: ''
      },
    })

    console.log("✅ Geração criada:", geracao)
    return NextResponse.json(geracao)
  } catch (error) {
    console.error("❌ Erro ao criar geração:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Já existe uma geração para esta usina nesta data" }, { status: 409 })
    }

    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { usinaConsorcioMap } from "@/lib/consorcio-map"

export async function GET(request: Request) {
  try {
    console.log("📊 [API] Buscando dados comparativos por consórcio...")

    const { searchParams } = new URL(request.url)
    const dataInicio = searchParams.get("dataInicio")
    const dataFim = searchParams.get("dataFim")
    const potenciaSelecionada = searchParams.get("potenciaSelecionada") // Alterado

    console.log("📋 [API] Parâmetros:", { dataInicio, dataFim, potenciaSelecionada }) // Alterado

    await prisma.$connect()
    console.log("✅ [API] Conectado ao banco de dados")

    const usinaWhere: any = {}
    if (potenciaSelecionada !== null && !isNaN(Number(potenciaSelecionada))) {
      usinaWhere.potencia = Number(potenciaSelecionada) // Alterado para filtro exato
    }

    const geracaoWhere: any = {}
    if (dataInicio && dataFim) {
      geracaoWhere.data = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      }
    }

    const usinas = await prisma.usina.findMany({
      where: usinaWhere, // Aplicar filtro de potência aqui
      include: {
        geracoes: {
          where: geracaoWhere,
          select: {
            energiaKwh: true,
          },
        },
      },
    })

    const consorcioData: {
      [key: string]: {
        potenciaTotal: number
        energiaMensal: number
      }
    } = {}

    usinas.forEach((usina) => {
      const consorcio = usinaConsorcioMap[usina.nome] || usina.distribuidora || "Outros"
      if (!consorcioData[consorcio]) {
        consorcioData[consorcio] = {
          potenciaTotal: 0,
          energiaMensal: 0,
        }
      }
      consorcioData[consorcio].potenciaTotal += usina.potencia || 0
      consorcioData[consorcio].energiaMensal += usina.geracoes.reduce((sum, g) => sum + g.energiaKwh, 0)
    })

    const result = Object.entries(consorcioData).map(([consorcio, data]) => ({
      consorcio,
      potencia: data.potenciaTotal,
      geracao: data.energiaMensal,
    }))

    console.log(`✅ [API] Dados comparativos por consórcio carregados: ${result.length} consórcios`)
    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ [API] Erro ao buscar dados comparativos por consórcio:", error)
    return NextResponse.json(
      {
        error: "Erro ao buscar dados comparativos por consórcio",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

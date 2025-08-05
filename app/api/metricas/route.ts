import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    console.log("📊 [API] Calculando métricas dos dados reais...")

    const { searchParams } = new URL(request.url)
    const usinaId = searchParams.get("usinaId")
    const dataInicio = searchParams.get("dataInicio")
    const dataFim = searchParams.get("dataFim")
    const consorcioFilter = searchParams.get("consorcio") // Renomeado para evitar conflito
    const distribuidora = searchParams.get("distribuidora") // Novo filtro
    const potenciaSelecionada = searchParams.get("potenciaSelecionada")

    console.log("📋 [API] Parâmetros:", {
      usinaId,
      dataInicio,
      dataFim,
      consorcioFilter,
      distribuidora,
      potenciaSelecionada,
    })

    // Conectar ao banco
    await prisma.$connect()
    console.log("✅ [API] Conectado ao banco de dados")

    // Filtros para usinas
    const usinaWhere: any = {}
    if (usinaId) {
      usinaWhere.id = Number.parseInt(usinaId)
    }
    if (consorcioFilter && consorcioFilter !== "todas") {
      usinaWhere.consorcio = consorcioFilter
    }
    if (distribuidora && distribuidora !== "todas") {
      usinaWhere.distribuidora = distribuidora
    }

    if (potenciaSelecionada !== null && !isNaN(Number(potenciaSelecionada))) {
      usinaWhere.potencia = Number(potenciaSelecionada)
    }

    console.log("🔍 [API] Filtros aplicados:", { usinaWhere })

    // Filtros para gerações
    const geracaoWhere: any = {}
    if (usinaId) {
      geracaoWhere.usinaId = Number.parseInt(usinaId)
    }
    if (dataInicio && dataFim) {
      geracaoWhere.data = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      }
    }

    // Buscar dados em paralelo
    const [totalUsinas, potenciaAggregate, geracoes] = await Promise.all([
      prisma.usina.count({ where: usinaWhere }),
      prisma.usina.aggregate({
        where: usinaWhere,
        _sum: { potencia: true },
      }),
      prisma.geracaoDiaria.findMany({
        where: {
          ...geracaoWhere,
          usina: {
            // Aplicar filtros de usina também nas gerações para consistência
            ...usinaWhere,
          },
        },
        select: {
          energiaKwh: true,
          data: true,
        },
      }),
    ])

    console.log("📈 [API] Dados brutos do banco:", {
      totalUsinas,
      potenciaTotal: potenciaAggregate._sum.potencia,
      totalGeracoes: geracoes.length,
    })

    const energiaNoPeriodo = geracoes.reduce((acc, g) => acc + g.energiaKwh, 0)

    // Calcular média diária com base nos dias com dados
    const uniqueDates = new Set(geracoes.map((g) => g.data.toISOString().split("T")[0]))
    const mediaGeracaoDiaria = uniqueDates.size > 0 ? energiaNoPeriodo / uniqueDates.size : 0

    console.log("📊 [API] Cálculos intermediários:", {
      energiaNoPeriodo: energiaNoPeriodo.toFixed(2),
      mediaGeracaoDiaria: mediaGeracaoDiaria.toFixed(2),
    })

    // Calcular crescimento comparando com período anterior
    let crescimentoNoPeriodo = 0
    if (dataInicio && dataFim && geracoes.length > 0) {
      const inicioAtual = new Date(dataInicio)
      const fimAtual = new Date(dataFim)
      const diffTime = Math.abs(fimAtual.getTime() - inicioAtual.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      const dataInicioAnterior = new Date(inicioAtual.getTime() - diffDays * 24 * 60 * 60 * 1000)
      const dataFimAnterior = inicioAtual

      console.log("📅 [API] Calculando crescimento:", {
        periodoAtual: `${inicioAtual.toISOString().split("T")[0]} até ${fimAtual.toISOString().split("T")[0]}`,
        periodoAnterior: `${dataInicioAnterior.toISOString().split("T")[0]} até ${dataFimAnterior.toISOString().split("T")[0]}`,
      })

      const geracoesPeriodoAnterior = await prisma.geracaoDiaria.findMany({
        where: {
          ...geracaoWhere,
          usina: {
            ...usinaWhere,
          },
          data: {
            gte: dataInicioAnterior,
            lt: dataFimAnterior,
          },
        },
        select: {
          energiaKwh: true,
        },
      })

      const energiaPeriodoAnterior = geracoesPeriodoAnterior.reduce((acc, g) => acc + g.energiaKwh, 0)
      if (energiaPeriodoAnterior > 0) {
        crescimentoNoPeriodo = ((energiaNoPeriodo - energiaPeriodoAnterior) / energiaPeriodoAnterior) * 100
      }

      console.log("📊 [API] Crescimento calculado:", {
        energiaNoPeriodo: energiaNoPeriodo.toFixed(2),
        energiaPeriodoAnterior: energiaPeriodoAnterior.toFixed(2),
        crescimentoNoPeriodo: crescimentoNoPeriodo.toFixed(2),
      })
    }

    // Calculate totalConsorcios based on filtered usinas
    const usinasFiltradasParaConsorcios = await prisma.usina.findMany({
      where: usinaWhere,
      select: { consorcio: true },
    })

    const uniqueConsorcios = new Set(
      usinasFiltradasParaConsorcios.map((usina) => usina.consorcio).filter(Boolean) as string[],
    )
    const totalConsorcios = uniqueConsorcios.size

    const metricas = {
      totalUsinas,
      potenciaTotal: potenciaAggregate._sum.potencia || 0,
      energiaNoPeriodo,
      mediaGeracaoDiaria,
      crescimentoNoPeriodo: Number.parseFloat(crescimentoNoPeriodo.toFixed(2)),
      totalConsorcios,
    }

    console.log("✅ [API] Métricas finais calculadas:", metricas)
    return NextResponse.json(metricas)
  } catch (error) {
    console.error("❌ [API] Erro ao calcular métricas:", error)
    return NextResponse.json(
      {
        error: "Erro ao calcular métricas do banco de dados",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

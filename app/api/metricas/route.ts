import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { usinaConsorcioMap } from "@/lib/consorcio-map"

export async function GET(request: Request) {
  try {
    console.log("📊 [API] Calculando métricas dos dados reais...")

    const { searchParams } = new URL(request.url)
    const usinaId = searchParams.get("usinaId")
    const dataInicio = searchParams.get("dataInicio")
    const dataFim = searchParams.get("dataFim")
    const consorcio = searchParams.get("consorcio")


    // Conectar ao banco
    await prisma.$connect()
   

    // Filtros para usinas
    const usinaWhere: any = {}
    if (usinaId) {
      usinaWhere.id = Number.parseInt(usinaId)
    }
    if (consorcio && consorcio !== "todos") {
      const usinasDoConsorcio = Object.entries(usinaConsorcioMap)
        .filter(([, mappedConsorcio]) => mappedConsorcio === consorcio)
        .map(([usinaNome]) => usinaNome);

      if (usinasDoConsorcio.length > 0) {
        usinaWhere.nome = {
          in: usinasDoConsorcio,
        };
      } else {
        // If no usinas match the consorcio, return metrics with zero values
        const metricas = {
          totalUsinas: 0,
          potenciaTotal: 0,
          energiaMensal: 0,
          energiaAnual: 0,
          mediaGeracaoDiaria: 0,
          crescimentoMensal: 0,
          totalConsorcios: 0, // New metric
        }
        return NextResponse.json(metricas)
      }
    }

 

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
        where: geracaoWhere,
        select: {
          energiaKwh: true,
          data: true,
        },
      }),
    ])

    
    const energiaMensal = geracoes.reduce((acc, g) => acc + g.energiaKwh, 0)
    const mediaGeracaoDiaria = geracoes.length > 0 ? energiaMensal / geracoes.length : 0


    // Calcular crescimento comparando com período anterior
    let crescimentoMensal = 0
    if (dataInicio && dataFim && geracoes.length > 0) {
      const diasPeriodo = Math.ceil(
        (new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / (1000 * 60 * 60 * 24),
      )

      const dataInicioAnterior = new Date(new Date(dataInicio).getTime() - diasPeriodo * 24 * 60 * 60 * 1000)
      const dataFimAnterior = new Date(dataInicio)


      const geracoesMesAnterior = await prisma.geracaoDiaria.findMany({
        where: {
          ...geracaoWhere,
          data: {
            gte: dataInicioAnterior,
            lt: dataFimAnterior,
          },
        },
        select: {
          energiaKwh: true,
        },
      })

      const energiaMesAnterior = geracoesMesAnterior.reduce((acc, g) => acc + g.energiaKwh, 0)
      if (energiaMesAnterior > 0) {
        crescimentoMensal = ((energiaMensal - energiaMesAnterior) / energiaMesAnterior) * 100
      }
    }

    // Calculate totalConsorcios
    const usinasFiltradasParaConsorcios = await prisma.usina.findMany({
      where: usinaWhere,
      select: { nome: true },
    });

    const uniqueConsorcios = new Set(
      usinasFiltradasParaConsorcios.map(usina => usinaConsorcioMap[usina.nome] || 'Outros')
    );
    const totalConsorcios = uniqueConsorcios.size;

    const metricas = {
      totalUsinas,
      potenciaTotal: potenciaAggregate._sum.potencia || 0,
      energiaMensal,
      energiaAnual: energiaMensal * 12, // Estimativa baseada no período
      mediaGeracaoDiaria,
      crescimentoMensal: Number.parseFloat(crescimentoMensal.toFixed(2)),
      totalConsorcios,
    }

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

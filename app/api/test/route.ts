import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("🧪 [API] Executando teste completo...")

    // Testar conexão básica
    await prisma.$connect()
    console.log("✅ [API] Conexão estabelecida")

    // Contar registros
    const [usinasCount, geracoesCount] = await Promise.all([prisma.usina.count(), prisma.geracaoDiaria.count()])

    // Buscar amostra de dados
    const usinasAmostra = await prisma.usina.findMany({
      take: 3,
      include: {
        geracoes: {
          take: 2,
          orderBy: { data: "desc" },
        },
      },
    })

    // Calcular estatísticas básicas
    const potenciaTotal = await prisma.usina.aggregate({
      _sum: { potencia: true },
    })

    const energiaTotal = await prisma.geracaoDiaria.aggregate({
      _sum: { energiaKwh: true },
    })

    // Dados dos últimos 7 dias
    const seteDiasAtras = new Date()
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

    const geracoesRecentes = await prisma.geracaoDiaria.count({
      where: {
        data: {
          gte: seteDiasAtras,
        },
      },
    })

    const result = {
      status: "OK",
      database: "Conectado",
      tables: {
        usinas: usinasCount,
        geracoes: geracoesCount,
      },
      statistics: {
        potenciaTotal: potenciaTotal._sum.potencia || 0,
        energiaTotal: energiaTotal._sum.energiaKwh || 0,
        geracoesUltimos7Dias: geracoesRecentes,
      },
      sample: usinasAmostra.map((usina) => ({
        id: usina.id,
        nome: usina.nome,
        potencia: usina.potencia,
        distribuidora: usina.distribuidora,
        geracoes: usina.geracoes.length,
        ultimaGeracao: usina.geracoes[0]
          ? {
              data: usina.geracoes[0].data,
              energia: usina.geracoes[0].energiaKwh,
            }
          : null,
      })),
      timestamp: new Date().toISOString(),
    }

    console.log("✅ [API] Teste completo concluído:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ [API] Erro no teste:", error)
    return NextResponse.json(
      {
        status: "ERROR",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔧 [DEBUG] Executando diagnóstico do sistema...")

    // Verificar se o Prisma está disponível
    let prismaStatus = "❌ Não disponível"
    let prismaError = null
    let databaseStats = null

    try {
      const { prisma } = await import("@/lib/prisma")
      await prisma.$connect()
      prismaStatus = "✅ Conectado"

      // Buscar estatísticas básicas
      const [usinasCount, geracoesCount] = await Promise.all([prisma.usina.count(), prisma.geracaoDiaria.count()])

      databaseStats = {
        usinas: usinasCount,
        geracoes: geracoesCount,
      }
    } catch (error) {
      prismaError = error instanceof Error ? error.message : "Erro desconhecido"
      console.error("❌ [DEBUG] Erro no Prisma:", error)
    }

    // Verificar variáveis de ambiente
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Definida" : "❌ Não definida",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Definida" : "❌ Não definida",
    }

    // Informações do sistema
    const systemInfo = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
    }

    const result = {
      status: "DEBUG_INFO",
      prisma: {
        status: prismaStatus,
        error: prismaError,
        stats: databaseStats,
      },
      environment: envVars,
      system: systemInfo,
      apis: {
        "/api/test": "Teste completo do sistema",
        "/api/usinas": "Buscar usinas com/sem gerações",
        "/api/metricas": "Calcular métricas do sistema",
        "/api/geracoes": "CRUD de gerações",
      },
    }

    console.log("✅ [DEBUG] Diagnóstico concluído:", result)

    return NextResponse.json(result, {
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("❌ [DEBUG] Erro no diagnóstico:", error)

    return NextResponse.json(
      {
        status: "DEBUG_ERROR",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

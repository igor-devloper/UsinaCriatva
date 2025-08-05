import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { usinaConsorcioMap } from "@/lib/consorcio-map"

export async function GET(request: Request) {
  try {
    console.log("🔍 [API] GET /api/usinas - Buscando dados reais do banco...")

    const { searchParams } = new URL(request.url)
    const includeGeracoes = searchParams.get("includeGeracoes") === "true"
    const dataInicio = searchParams.get("dataInicio")
    const dataFim = searchParams.get("dataFim")
    const consorcio = searchParams.get("consorcio")
    const potenciaSelecionada = searchParams.get("potenciaSelecionada") // Alterado

    console.log("📋 [API] Parâmetros:", { includeGeracoes, dataInicio, dataFim, consorcio, potenciaSelecionada }) // Alterado

    // Conectar ao banco
    await prisma.$connect()
    console.log("✅ [API] Conectado ao banco de dados")

    // Filtros para usinas
    const usinaWhere: any = {}
    if (consorcio && consorcio !== "todos") {
      const usinasDoConsorcio = Object.entries(usinaConsorcioMap)
        .filter(([, mappedConsorcio]) => mappedConsorcio === consorcio)
        .map(([usinaNome]) => usinaNome)

      if (usinasDoConsorcio.length > 0) {
        usinaWhere.nome = {
          in: usinasDoConsorcio,
        }
      } else {
        // If no usinas match the consorcio, return an empty array
        return NextResponse.json([], {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        })
      }
    }

    if (potenciaSelecionada !== null && !isNaN(Number(potenciaSelecionada))) {
      usinaWhere.potencia = Number(potenciaSelecionada) // Alterado para filtro exato
    }

    // Filtros para gerações
    let geracaoFilters: any = {}
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio)
      const fim = new Date(dataFim)

      console.log("📅 [API] Filtros de data:", {
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
      })

      geracaoFilters = {
        data: {
          gte: inicio,
          lte: fim,
        },
      }
    }

    console.log("🔍 [API] Executando query no Prisma...")
    console.log("🔍 [API] Filtros usina:", usinaWhere)
    console.log("🔍 [API] Filtros geração:", geracaoFilters)

    const usinas = await prisma.usina.findMany({
      where: usinaWhere,
      include: {
        geracoes: includeGeracoes
          ? {
              where: geracaoFilters,
              orderBy: {
                data: "asc",
              },
            }
          : false,
      },
      orderBy: {
        nome: "asc",
      },
    })

    console.log(`✅ [API] Query executada: ${usinas.length} usinas encontradas`)

    if (includeGeracoes) {
      const totalGeracoes = usinas.reduce((acc, usina) => acc + (usina.geracoes?.length || 0), 0)
      const energiaTotal = usinas.reduce(
        (acc, usina) => acc + (usina.geracoes?.reduce((sum, g) => sum + g.energiaKwh, 0) || 0),
        0,
      )

      console.log(`⚡ [API] Total de gerações no período: ${totalGeracoes}`)
      console.log(`⚡ [API] Energia total: ${energiaTotal.toFixed(2)} kWh`)

      // Log detalhado das primeiras usinas
      usinas.slice(0, 3).forEach((usina, index) => {
        const geracoesCount = usina.geracoes?.length || 0
        const energiaUsina = usina.geracoes?.reduce((sum, g) => sum + g.energiaKwh, 0) || 0
        console.log(`📈 [API] Usina ${index + 1}: ${usina.nome}`)
        console.log(`   📊 Gerações: ${geracoesCount}`)
        console.log(`   ⚡ Energia: ${energiaUsina.toFixed(2)} kWh`)

        if (geracoesCount > 0 && usina.geracoes) {
          const primeiraGeracao = usina.geracoes[0]
          const ultimaGeracao = usina.geracoes[usina.geracoes.length - 1]
          console.log(
            `   📅 Período: ${primeiraGeracao.data.toISOString().split("T")[0]} até ${ultimaGeracao.data.toISOString().split("T")[0]}`,
          )
        }
      })
    }

    // Adicionar campo consorcio baseado na distribuidora para compatibilidade
    const usinasComConsorcio = usinas.map((usina) => ({
      ...usina,
      consorcio: usinaConsorcioMap[usina.nome] || usina.distribuidora || "Outros",
    }))

    console.log("✅ [API] Resposta preparada com sucesso")
    return NextResponse.json(usinasComConsorcio, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("❌ [API] Erro ao buscar usinas:", error)

    return NextResponse.json(
      {
        error: "Erro ao buscar usinas do banco de dados",
        details: error instanceof Error ? error.message : "Erro desconhecido",
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

export async function POST(request: Request) {
  try {
    console.log("➕ [API] POST /api/usinas")

    const body = await request.json()
    const { nome, distribuidora, potencia, consorcio, latitude, longitude } = body // Adicionado consorcio, latitude, longitude

    if (!nome) {
      return NextResponse.json(
        { error: "Nome da usina é obrigatório" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const usina = await prisma.usina.create({
      data: {
        nome,
        distribuidora: distribuidora || null,
        consorcio: consorcio || null, // Adicionado
        latitude: latitude !== null ? Number.parseFloat(latitude) : null, // Adicionado
        longitude: longitude !== null ? Number.parseFloat(longitude) : null, // Adicionado
        potencia: potencia ? Number.parseFloat(potencia) : null,
      },
    })

    console.log("✅ [API] Usina criada:", usina)

    return NextResponse.json(usina, {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("❌ [API] Erro ao criar usina:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Já existe uma usina com este nome" },
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

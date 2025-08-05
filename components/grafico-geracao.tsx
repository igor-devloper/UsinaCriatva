"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import type { GeracaoDiaria } from "@/types/usina" // Assuming GeracaoDiaria is imported from a types file
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface GraficoGeracaoProps {
  dados: GeracaoDiaria[]
  periodo: "diario" | "mensal" | "anual" | "custom"
}

export function GraficoGeracao({ dados, periodo }: GraficoGeracaoProps) {
  const formatarDataEixoX = (tickItem: number) => {
    const date = new Date(tickItem)
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (isNaN(localDate.getTime())) {
      return String(tickItem)
    }
    switch (periodo) {
      case "diario":
        return format(localDate, "dd/MM", { locale: ptBR })
      case "mensal":
        return format(localDate, "MMM/yy", { locale: ptBR })
      case "anual":
        return format(localDate, "yyyy", { locale: ptBR })
      default:
        return format(localDate, "dd/MM/yyyy", { locale: ptBR })
    }
  }

  const dadosGrafico = dados.map((item) => {
    const date = new Date(item.data)
    const localStartOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    return {
      data: localStartOfDay.getTime(),
      energia: item.energiaKwh,
      dataCompleta: format(localStartOfDay, "dd/MM/yyyy", { locale: ptBR }),
    }
  })

  const formatarEnergia = (kwh: number) => {
    if (kwh >= 1000000) {
      return `${(kwh / 1000000).toFixed(1)} GWh`
    } else if (kwh >= 1000) {
      return `${(kwh / 1000).toFixed(1)} MWh`
    }
    return `${kwh.toFixed(1)} kWh`
  }

  console.log("📈 [GraficoGeracao] Dados recebidos para o gráfico:", dadosGrafico.length, "pontos.")
  if (dadosGrafico.length > 0) {
    console.log("📈 [GraficoGeracao] Primeiro ponto:", dadosGrafico[0])
    console.log("📈 [GraficoGeracao] Último ponto:", dadosGrafico[dadosGrafico.length - 1])
    dadosGrafico.forEach((d, i) =>
      console.log(
        `📈 [GraficoGeracao] Ponto ${i}: Data=${d.dataCompleta} (Timestamp: ${d.data}), Energia=${d.energia}`,
      ),
    )
  } else {
    console.log("📈 [GraficoGeracao] Nenhum dado para renderizar o gráfico.")
  }

  console.log("📈 [GraficoGeracao] Dados finais para LineChart:", dadosGrafico)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geração de Energia</CardTitle>
        <CardDescription>Evolução da geração de energia no período selecionado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="data"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={formatarDataEixoX}
                type="number"
                domain={["dataMin", "dataMax"]}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={formatarEnergia}
                stroke="hsl(var(--muted-foreground))"
                domain={[0, "auto"]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const formattedDate = formatarDataEixoX(label as number)
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">Data</span>
                            <span className="font-bold text-muted-foreground">{formattedDate}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">Energia</span>
                            <span className="font-bold">{formatarEnergia(payload[0]?.value as number)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="energia"
                stroke="#8884d8" // Alterado para uma cor fixa (azul/roxo) para teste
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

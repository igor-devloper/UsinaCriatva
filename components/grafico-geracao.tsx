"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface GeracaoDiaria {
  data: string | number | Date
  energiaKwh: number
}

interface GraficoGeracaoProps {
  dados: GeracaoDiaria[]
  periodo: "diario" | "mensal" | "anual"
}

export function GraficoGeracao({ dados, periodo }: GraficoGeracaoProps) {
  // ✅ Monta os dados com validação e logs de erro
  const dadosGrafico = dados
    .map((item, index) => {
      const dataObj = new Date(item.data)

      if (isNaN(dataObj.getTime())) {
        console.warn(`⚠️ [Dado inválido] Data inválida no índice ${index}:`, item.data)
        return null
      }

      if (typeof item.energiaKwh !== "number" || isNaN(item.energiaKwh)) {
        console.warn(`⚠️ [Dado inválido] Energia inválida no índice ${index}:`, item.energiaKwh)
        return null
      }

      return {
        data: dataObj.getTime(),
        energia: item.energiaKwh,
        dataCompleta: format(dataObj, "dd/MM/yyyy", { locale: ptBR }),
      }
    })
    .filter(Boolean) // remove nulls

  // ✅ Formata o eixo X baseado no período
  const formatarDataEixoX = (tick: number) => {
    const date = new Date(tick)
    switch (periodo) {
      case "diario":
        return format(date, "dd/MM", { locale: ptBR })
      case "mensal":
        return format(date, "MMM/yy", { locale: ptBR })
      case "anual":
        return format(date, "yyyy", { locale: ptBR })
      default:
        return format(date, "dd/MM/yyyy", { locale: ptBR })
    }
  }

  const formatarEnergia = (kwh: number) => {
    if (kwh >= 1000000) return `${(kwh / 1000000).toFixed(1)} GWh`
    if (kwh >= 1000) return `${(kwh / 1000).toFixed(1)} MWh`
    return `${kwh.toFixed(1)} kWh`
  }

  // ✅ Logs úteis
  console.log("📊 Total de dados válidos:", dadosGrafico.length)
  if (dadosGrafico.length) {
    console.log("📊 Primeiro:", dadosGrafico[0])
    console.log("📊 Último:", dadosGrafico[dadosGrafico.length - 1])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geração de Energia</CardTitle>
        <CardDescription>Evolução da geração de energia no período selecionado</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="data"
                type="number"
                tickFormatter={formatarDataEixoX}
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tickFormatter={formatarEnergia}
                tick={{ fontSize: 12 }}
                domain={[0, "auto"]}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const p = payload[0].payload
                    return (
                      <div className="p-2 border rounded bg-background shadow-sm text-sm">
                        <div><strong>Data:</strong> {p.dataCompleta}</div>
                        <div><strong>Energia:</strong> {formatarEnergia(p.energia)}</div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="energia"
                stroke="#22c55e" // verde forte visível
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

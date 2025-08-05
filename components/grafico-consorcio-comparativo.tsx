"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ConsorcioComparativoData {
  consorcio: string
  potencia: number
  geracao: number
}

interface GraficoComparativoConsorcioProps {
  dados: ConsorcioComparativoData[]
}

export function GraficoComparativoConsorcio({ dados }: GraficoComparativoConsorcioProps) {
  const formatarPotencia = (kw: number) => {
    if (kw >= 1000) {
      return `${(kw / 1000).toFixed(1)} MW`
    }
    return `${kw.toFixed(1)} kW`
  }

  const formatarEnergia = (kwh: number) => {
    if (kwh >= 1000000) {
      return `${(kwh / 1000000).toFixed(1)} GWh`
    } else if (kwh >= 1000) {
      return `${(kwh / 1000).toFixed(1)} MWh`
    }
    return `${kwh.toFixed(1)} kWh`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Potência Instalada vs. Geração Mensal por Consórcio</CardTitle>
        <CardDescription>Comparativo da capacidade e geração de energia por consórcio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="consorcio" tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#8884d8"
                tickFormatter={formatarPotencia}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#82ca9d"
                tickFormatter={formatarEnergia}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "Potência Instalada") {
                    return formatarPotencia(value)
                  }
                  return formatarEnergia(value)
                }}
                labelFormatter={(label) => `Consórcio: ${label}`}
                contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="potencia" fill="#3b82f6" name="Potência Instalada" />
              <Bar yAxisId="right" dataKey="geracao" fill="#10b981" name="Geração Mensal" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

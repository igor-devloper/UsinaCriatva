"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Filter } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { FiltrosPeriodo, Usina } from "@/types/usina"

interface FiltrosDashboardProps {
  usinas: Usina[]
  filtros: FiltrosPeriodo
  onFiltrosChange: (filtros: FiltrosPeriodo) => void
  onExportarPDF: () => void
}

export function FiltrosDashboard({ usinas, filtros, onFiltrosChange, onExportarPDF }: FiltrosDashboardProps) {
  const [dataInicio, setDataInicio] = useState<Date>(filtros.dataInicio)
  const [dataFim, setDataFim] = useState<Date>(filtros.dataFim)

  // Extrair consórcios únicos das usinas, garantindo que 'consorcio' seja o campo principal
  const consorcios = Array.from(new Set(usinas.map((u) => u.consorcio).filter(Boolean) as string[])).sort()

  const handlePeriodoChange = (periodo: "diario" | "mensal" | "anual") => {
    const hoje = new Date()
    let novaDataInicio: Date
    const novaDataFim = hoje // A data final é sempre "hoje" para esses filtros

    switch (periodo) {
      case "diario":
        novaDataInicio = new Date(hoje.getTime() - 24 * 60 * 60 * 1000) // Últimas 24 horas
        break
      case "mensal":
        novaDataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
        break
      case "anual":
        novaDataInicio = new Date(hoje.getTime() - 365 * 24 * 60 * 60 * 1000) // Últimos 365 dias
        break
      default:
        novaDataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000) // Padrão: últimos 30 dias
        break
    }

    setDataInicio(novaDataInicio)
    setDataFim(novaDataFim)

    onFiltrosChange({
      ...filtros,
      periodo,
      dataInicio: novaDataInicio,
      dataFim: novaDataFim,
    })
  }

  const handleUsinaChange = (usinaId: string) => {
    onFiltrosChange({
      ...filtros,
      usinaId: usinaId === "todas" ? undefined : Number.parseInt(usinaId),
    })
  }

  const handleConsorcioChange = (consorcio: string) => {
    onFiltrosChange({
      ...filtros,
      consorcio: consorcio === "todos" ? undefined : consorcio,
    })
  }

  const handleDataChange = () => {
    onFiltrosChange({
      ...filtros,
      dataInicio,
      dataFim,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Análise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Período */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <Select value={filtros.periodo} onValueChange={handlePeriodoChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diário</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Consórcio */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Consórcio</label>
            <Select value={filtros.consorcio || "todos"} onValueChange={handleConsorcioChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Consórcios</SelectItem>
                {consorcios.map((consorcio) => (
                  <SelectItem key={consorcio} value={consorcio || ""}>
                    {consorcio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Usina */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Usina</label>
            <Select value={filtros.usinaId?.toString() || "todas"} onValueChange={handleUsinaChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Usinas</SelectItem>
                {usinas.map((usina) => (
                  <SelectItem key={usina.id} value={usina.id.toString()}>
                    {usina.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Início */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Início</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !dataInicio && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dataInicio}
                  onSelect={(date) => {
                    if (date) {
                      setDataInicio(date)
                      handleDataChange()
                    }
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data Fim */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Fim</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !dataFim && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dataFim}
                  onSelect={(date) => {
                    if (date) {
                      setDataFim(date)
                      handleDataChange()
                    }
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onExportarPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

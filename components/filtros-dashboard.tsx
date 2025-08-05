"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Filter } from "lucide-react"
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { FiltrosPeriodo, Usina } from "@/types/usina"

interface FiltrosDashboardProps {
  usinas: Usina[]
  filtros: FiltrosPeriodo
  onFiltrosChange: (filtros: FiltrosPeriodo) => void
  onExportarPDF: () => void
  uniquePotencias: number[] // Nova prop para as potências únicas
}

export function FiltrosDashboard({
  usinas,
  filtros,
  onFiltrosChange,
  onExportarPDF,
  uniquePotencias,
}: FiltrosDashboardProps) {
  const [dataInicioLocal, setDataInicioLocal] = useState<Date>(filtros.dataInicio)
  const [dataFimLocal, setDataFimLocal] = useState<Date>(filtros.dataFim)
  const [potenciaSelecionadaLocal, setPotenciaSelecionadaLocal] = useState<string>(
    filtros.potenciaSelecionada?.toString() || "todas",
  )

  // Sincroniza estados locais com props quando filtros mudam externamente
  useEffect(() => {
    setDataInicioLocal(filtros.dataInicio)
    setDataFimLocal(filtros.dataFim)
    setPotenciaSelecionadaLocal(filtros.potenciaSelecionada?.toString() || "todas")
  }, [filtros])

  // Extrair consórcios únicos das usinas, garantindo que 'consorcio' seja o campo principal
  const consorcios = Array.from(new Set(usinas.map((u) => u.consorcio).filter(Boolean) as string[])).sort()

  const handlePeriodoChange = (periodo: "diario" | "mensal" | "anual" | "custom") => {
    const hoje = new Date()
    let novaDataInicio: Date
    let novaDataFim: Date = hoje

    switch (periodo) {
      case "diario":
        novaDataInicio = subDays(hoje, 1) // Últimas 24 horas
        break
      case "mensal":
        novaDataInicio = startOfMonth(hoje) // Início do mês atual
        novaDataFim = endOfMonth(hoje) // Fim do mês atual
        break
      case "anual":
        novaDataInicio = startOfYear(hoje) // Início do ano atual
        novaDataFim = endOfYear(hoje) // Fim do ano atual
        break
      case "custom":
      default:
        // Mantém as datas atuais ou usa um padrão se não houver
        novaDataInicio = dataInicioLocal || subMonths(hoje, 1)
        novaDataFim = dataFimLocal || hoje
        break
    }

    setDataInicioLocal(novaDataInicio)
    setDataFimLocal(novaDataFim)

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

  const handlePotenciaChange = (potencia: string) => {
    setPotenciaSelecionadaLocal(potencia)
    onFiltrosChange({
      ...filtros,
      potenciaSelecionada: potencia === "todas" ? undefined : Number.parseFloat(potencia),
    })
  }

  // Adicione este console.log para ver as potências disponíveis
  console.log("💡 [FiltrosDashboard] Potências únicas disponíveis no dropdown:", uniquePotencias)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Análise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Período */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <Select value={filtros.periodo} onValueChange={handlePeriodoChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Últimas 24h</SelectItem>
                <SelectItem value="mensal">Mês Atual</SelectItem>
                <SelectItem value="anual">Ano Atual</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
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

          {/* Potência Selecionada (Dropdown) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Potência (kW)</label>
            <Select value={potenciaSelecionadaLocal} onValueChange={handlePotenciaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as Potências" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Potências</SelectItem>
                {(uniquePotencias || []).map((potencia) => (
                  <SelectItem key={potencia} value={potencia.toString()}>
                    {potencia.toFixed(1)} kW
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
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataInicioLocal && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataInicioLocal ? format(dataInicioLocal, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dataInicioLocal}
                  onSelect={(date) => {
                    if (date) {
                      setDataInicioLocal(date)
                      onFiltrosChange({ ...filtros, dataInicio: date, periodo: "custom" })
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
                  className={cn("w-full justify-start text-left font-normal", !dataFimLocal && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataFimLocal ? format(dataFimLocal, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dataFimLocal}
                  onSelect={(date) => {
                    if (date) {
                      setDataFimLocal(date)
                      onFiltrosChange({ ...filtros, dataFim: date, periodo: "custom" })
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

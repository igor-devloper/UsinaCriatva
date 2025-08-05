"use client"

import { useState, useEffect } from "react"
import { MetricasCards } from "@/components/metricas-cards"
import { FiltrosDashboard } from "@/components/filtros-dashboard"
import { GraficoGeracao } from "@/components/grafico-geracao"
import { TabelaUsinas } from "@/components/tabela-usinas"
import { FormAdicionarGeracao } from "@/components/form-adicionar-geracao"
import { DebugPanel } from "@/components/debug-panel"
import { exportarPDF } from "@/lib/export-pdf"
import { useUsinas } from "@/hooks/use-usinas"
import { useMetricas } from "@/hooks/use-metricas"
import { GraficoComparativoConsorcio } from "@/components/grafico-consorcio-comparativo"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FiltrosPeriodo, GeracaoDiaria } from "@/types/usina"

export default function DashboardUsinas() {
  
  const initialDataInicio = new Date(2025, 0, 1) // 1º de Janeiro de 2024
  const initialDataFim = new Date(2025, 0, 31) // 31 de Janeiro de 2024

  const [filtros, setFiltros] = useState<FiltrosPeriodo>({
    periodo: "mensal",
    dataInicio: initialDataInicio,
    dataFim: initialDataFim,
    usinaId: undefined,
    consorcio: undefined,
  })

  const [consorcioComparativoData, setConsorcioComparativoData] = useState<any[]>([])
  const [loadingConsorcioData, setLoadingConsorcioData] = useState(true)

  const { usinas, loading: loadingUsinas, error: errorUsinas, refetch: refetchUsinas } = useUsinas(filtros)
  const { metricas, loading: loadingMetricas, error: errorMetricas, refetch: refetchMetricas } = useMetricas(filtros)

  const [error, setError] = useState<string | null>(null)

  // Obter dados para o gráfico
  const obterDadosGrafico = (): GeracaoDiaria[] => {
  

    const usinasFiltradas = filtros.usinaId ? usinas.filter((u) => u.id === filtros.usinaId) : usinas

    const dadosGeracao = usinasFiltradas
      .flatMap((usina) => usina.geracoes || [])
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    if (dadosGeracao.length > 0) {
      // Log de alguns exemplos de dados para o gráfico
      dadosGeracao
        .slice(0, 5)
        .forEach((d, i) => console.log(`📊 [Dashboard] Exemplo ${i}: Data=${d.data}, Energia=${d.energiaKwh}`))
    } else {
      console.log("📊 [Dashboard] Nenhum dado de geração encontrado para o período/filtros selecionados.")
    }

    return dadosGeracao
  }

  const handleExportarPDF = () => {
    if (!metricas) {
      alert("Aguarde o carregamento dos dados para exportar")
      return
    }

    const dadosExport = {
      metricas,
      usinas: filtros.usinaId ? usinas.filter((u) => u.id === filtros.usinaId) : usinas,
      filtros,
    }

    console.log("📄 Dados para exportação:", dadosExport)
    exportarPDF(dadosExport)
  }

  const handleAdicionarGeracao = () => {
    refetchUsinas()
    refetchMetricas()
  }

  const handleRetry = () => {
    refetchUsinas()
    refetchMetricas()
    fetchConsorcioComparativoData()
  }

  const fetchConsorcioComparativoData = async () => {
    try {
      setLoadingConsorcioData(true)
      console.log("🔄 Buscando dados comparativos por consórcio...", filtros)

      const params = new URLSearchParams()
      if (filtros.dataInicio && filtros.dataFim) {
        params.append("dataInicio", filtros.dataInicio.toISOString())
        params.append("dataFim", filtros.dataFim.toISOString())
      }

      const url = `/api/consorcio-comparativo?${params}`
      console.log("📡 Fazendo requisição para:", url)

      const response = await fetch(url)
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("✅ Dados comparativos por consórcio carregados:", data)
      setConsorcioComparativoData(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido ao buscar dados comparativos por consórcio"
      console.error("❌ Erro ao buscar dados comparativos por consórcio:", errorMessage)
      setError(errorMessage)
    } finally {
      setLoadingConsorcioData(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setError(null)
      await Promise.all([refetchUsinas(), refetchMetricas(), fetchConsorcioComparativoData()])
    }

    loadData()
  }, [filtros.dataInicio?.toISOString(), filtros.dataFim?.toISOString(), filtros.usinaId, filtros.consorcio])

  const dadosGrafico = obterDadosGrafico()
  const hasError = errorUsinas || errorMetricas || error

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard de Usinas Solares</h2>
        <div className="flex items-center gap-2">
          {!loadingUsinas && <FormAdicionarGeracao usinas={usinas} onSuccess={handleAdicionarGeracao} />}
        </div>
      </div>

      {/* Debug Panel - só mostra se houver erro */}
      {hasError && <DebugPanel />}

      {/* Erro com botão de retry */}
      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Erro ao carregar dados: {errorUsinas || errorMetricas || error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry} className="ml-4 bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <FiltrosDashboard
        usinas={usinas}
        filtros={filtros}
        onFiltrosChange={setFiltros}
        onExportarPDF={handleExportarPDF}
      />

      {/* Métricas */}
      {loadingMetricas ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : metricas ? (
        <MetricasCards metricas={metricas} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 border rounded-lg flex items-center justify-center text-muted-foreground">
              Sem dados no período
            </div>
          ))}
        </div>
      )}

      {/* Gráfico */}
      {loadingUsinas ? (
        <Skeleton className="h-[400px]" />
      ) : (
        <GraficoGeracao dados={dadosGrafico} periodo={filtros.periodo} />
      )}

      {/* Gráfico Comparativo Consórcio */}
      {loadingConsorcioData ? (
        <Skeleton className="h-[400px]" />
      ) : (
        <GraficoComparativoConsorcio dados={consorcioComparativoData} />
      )}

      {/* Tabela de Usinas */}
      {loadingUsinas ? <Skeleton className="h-64" /> : <TabelaUsinas usinas={usinas} />}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import type { MetricasUsina, FiltrosPeriodo } from "@/types/usina"

export function useMetricas(filtros: FiltrosPeriodo) {
  const [metricas, setMetricas] = useState<MetricasUsina | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetricas = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Buscando métricas...", filtros)

      const params = new URLSearchParams()

      if (filtros.usinaId) {
        params.append("usinaId", filtros.usinaId.toString())
      }
      if (filtros.consorcio) {
        params.append("consorcio", filtros.consorcio)
      }
      if (filtros.dataInicio && filtros.dataFim) {
        params.append("dataInicio", filtros.dataInicio.toISOString())
        params.append("dataFim", filtros.dataFim.toISOString())
      }
      if (filtros.potenciaSelecionada !== undefined && filtros.potenciaSelecionada !== null) {
        params.append("potenciaSelecionada", filtros.potenciaSelecionada.toString()) // Alterado
      }

      const url = `/api/metricas?${params}`
      console.log("📡 URL da requisição:", url)

      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Métricas carregadas:", data)

      setMetricas(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      console.error("❌ Erro ao buscar métricas:", errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetricas()
  }, [
    filtros.usinaId,
    filtros.dataInicio?.toISOString(),
    filtros.dataFim?.toISOString(),
    filtros.consorcio,
    filtros.potenciaSelecionada, // Alterado
  ])

  return { metricas, loading, error, refetch: fetchMetricas }
}

"use client"

import { useState, useEffect } from "react"
import type { Usina, FiltrosPeriodo } from "@/types/usina"

export function useUsinas(filtros?: FiltrosPeriodo) {
  const [usinas, setUsinas] = useState<Usina[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsinas = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Buscando usinas...", filtros)

      const params = new URLSearchParams({
        includeGeracoes: "true",
      })

      if (filtros?.dataInicio && filtros?.dataFim) {
        params.append("dataInicio", filtros.dataInicio.toISOString())
        params.append("dataFim", filtros.dataFim.toISOString())
      }

      const url = `/api/usinas?${params}`
      console.log("📡 URL da requisição:", url)

      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Usinas carregadas:", data.length)

      setUsinas(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      console.error("❌ Erro ao buscar usinas:", errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsinas()
  }, [filtros?.dataInicio?.toISOString(), filtros?.dataFim?.toISOString()])

  return { usinas, loading, error, refetch: fetchUsinas }
}

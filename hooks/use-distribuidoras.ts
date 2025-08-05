"use client"

import { useState, useEffect } from "react"

export function useDistribuidoras() {
  const [distribuidoras, setDistribuidoras] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDistribuidoras = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Buscando distribuidoras únicas...")
      const response = await fetch("/api/distribuidoras")
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      const data: string[] = await response.json()
      setDistribuidoras(data)
      console.log("✅ Distribuidoras carregadas:", data.length)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao buscar distribuidoras"
      console.error("❌ Erro ao buscar distribuidoras:", errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDistribuidoras()
  }, [])

  return { distribuidoras, loading, error, refetch: fetchDistribuidoras }
}

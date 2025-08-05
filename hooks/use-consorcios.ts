"use client"

import { useState, useEffect } from "react"

export function useConsorcios() {
  const [consorcios, setConsorcios] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConsorcios = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Buscando consórcios únicos...")
      const response = await fetch("/api/consorcios")
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      const data: string[] = await response.json()
      setConsorcios(data)
      console.log("✅ Consórcios carregados:", data.length)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao buscar consórcios"
      console.error("❌ Erro ao buscar consórcios:", errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConsorcios()
  }, [])

  return { consorcios, loading, error, refetch: fetchConsorcios }
}

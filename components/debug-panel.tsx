"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, RefreshCw, Database, AlertTriangle, CheckCircle, Globe, Zap, Factory, Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false) // Fechado por padrão agora que está funcionando
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testEndpoint = async (endpoint: string, name: string) => {
    try {
      console.log(`🧪 Testando ${name}...`)

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      console.log(`📡 ${name} - Status: ${response.status}`)

      let data: any = null
      let rawText = ""

      try {
        rawText = await response.text()
        data = JSON.parse(rawText)
        console.log(`✅ ${name} - Dados reais carregados`)
      } catch (parseError) {
        console.error(`❌ ${name} - JSON parse error:`, parseError)

        setTestResults((prev: any) => ({
          ...prev,
          [name]: {
            status: "PARSE_ERROR",
            statusCode: response.status,
            error: `Erro de parsing JSON: ${parseError instanceof Error ? parseError.message : "Erro desconhecido"}`,
            rawResponse: rawText.substring(0, 500) + (rawText.length > 500 ? "..." : ""),
            isHtml: rawText.trim().startsWith("<!DOCTYPE") || rawText.trim().startsWith("<html"),
          },
        }))
        return
      }

      setTestResults((prev: any) => ({
        ...prev,
        [name]: {
          status: response.ok ? "OK" : "ERROR",
          statusCode: response.status,
          data: response.ok ? data : null,
          error: response.ok ? null : data?.error || `HTTP ${response.status}`,
          rawResponse: rawText.substring(0, 200),
        },
      }))
    } catch (networkError) {
      console.error(`❌ ${name} erro de rede:`, networkError)
      setTestResults((prev: any) => ({
        ...prev,
        [name]: {
          status: "NETWORK_ERROR",
          error: networkError instanceof Error ? networkError.message : "Erro de rede desconhecido",
        },
      }))
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setTestResults({})

    // Testar endpoints sequencialmente para melhor debug
    await testEndpoint("/api/test", "Teste Completo")
    // Usando um período fixo dentro da faixa de dados reais (Setembro 2023 a Julho 2025)
    await testEndpoint(
      "/api/usinas?includeGeracoes=true&dataInicio=2023-09-01&dataFim=2024-01-31",
      "Usinas com Gerações (Set-Jan 2023/2024)",
    )
    await testEndpoint("/api/metricas?dataInicio=2023-09-01&dataFim=2024-01-31", "Métricas (Set-Jan 2023/2024)")

    setLoading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência",
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("pt-BR").format(num)
  }

  const formatPower = (kw: number) => {
    if (kw >= 1000000) {
      return `${(kw / 1000000).toFixed(1)} GW`
    } else if (kw >= 1000) {
      return `${(kw / 1000).toFixed(1)} MW`
    }
    return `${kw.toFixed(1)} kW`
  }

  const formatEnergy = (kwh: number) => {
    if (kwh >= 1000000) {
      return `${(kwh / 1000000).toFixed(1)} GWh`
    } else if (kwh >= 1000) {
      return `${(kwh / 1000).toFixed(1)} MWh`
    }
    return `${kwh.toFixed(1)} kWh`
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm text-blue-800">Debug Panel - Dados Reais do Banco 🗄️</CardTitle>
              </div>
              <ChevronDown className={`h-4 w-4 text-blue-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
            <CardDescription className="text-blue-700">
              Sistema usando apenas dados reais do Prisma - Clique para diagnosticar
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Button onClick={runAllTests} disabled={loading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Testar APIs com Dados Reais
              </Button>
            </div>

            {Object.keys(testResults).length > 0 && (
              <div className="space-y-3">
                {Object.entries(testResults).map(([name, result]: [string, any]) => (
                  <div key={name} className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span className="font-medium">{name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.status === "OK" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <Badge variant={result.status === "OK" ? "default" : "destructive"}>
                          {result.statusCode ? `${result.status} ${result.statusCode}` : result.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Mostrar dados de sucesso */}
                    {result.status === "OK" && result.data && (
                      <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
                        {name === "Teste Completo" && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Factory className="h-4 w-4" />
                              <strong>Usinas no banco:</strong> {formatNumber(result.data.tables.usinas)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              <strong>Gerações no banco:</strong> {formatNumber(result.data.tables.geracoes)}
                            </div>
                            {result.data.statistics && (
                              <>
                                <p>
                                  <strong>Potência Total:</strong> {formatPower(result.data.statistics.potenciaTotal)}
                                </p>
                                <p>
                                  <strong>Energia Total:</strong> {formatEnergy(result.data.statistics.energiaTotal)}
                                </p>
                              </>
                            )}
                          </div>
                        )}

                        {name.includes("Usinas com Gerações") && (
                          <div>
                            <p>
                              <strong>
                                ✅ {Array.isArray(result.data) ? result.data.length : 0} usinas do banco carregadas
                              </strong>
                            </p>
                            {Array.isArray(result.data) && result.data[0] && (
                              <p>Primeira usina: {result.data[0].nome}</p>
                            )}
                            {Array.isArray(result.data) && (
                              <p>
                                Total de gerações:{" "}
                                {result.data.reduce((acc: number, u: any) => acc + (u.geracoes?.length || 0), 0)}
                              </p>
                            )}
                          </div>
                        )}

                        {name.includes("Métricas") && (
                          <div className="space-y-1">
                            <p>
                              <strong>Total de usinas:</strong> {formatNumber(result.data.totalUsinas)}
                            </p>
                            <p>
                              <strong>Potência total:</strong> {formatPower(result.data.potenciaTotal)}
                            </p>
                            <p>
                              <strong>Energia no período:</strong> {formatEnergy(result.data.energiaMensal)}
                            </p>
                            <p>
                              <strong>Média diária:</strong> {formatEnergy(result.data.mediaGeracaoDiaria)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mostrar erros */}
                    {(result.error || result.status !== "OK") && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded space-y-2">
                        <div>
                          <strong>❌ Erro:</strong> {result.error}
                        </div>

                        {result.rawResponse && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <strong>📄 Resposta Raw:</strong>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(result.rawResponse)}
                                className="h-6 px-2"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{result.rawResponse}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-muted-foreground bg-white p-3 rounded border">
              <p className="font-medium mb-2 text-blue-700">🗄️ Sistema usando apenas dados reais:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Todos os dados vêm diretamente do banco Prisma</li>
                <li>Período padrão do dashboard: Mês atual</li>
                <li>Período de teste do Debug Panel: Setembro 2023 a Janeiro 2024</li>
                <li>Filtros funcionam com dados reais do banco</li>
                <li>Consórcios baseados nas distribuidoras reais</li>
              </ul>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

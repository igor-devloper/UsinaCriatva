import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Zap, Factory, Calendar, BarChart3 } from "lucide-react"
import type { MetricasUsina } from "@/types/usina"

interface MetricasCardsProps {
  metricas: MetricasUsina
}

export function MetricasCards({ metricas }: MetricasCardsProps) {
  const formatarNumero = (num: number) => {
    return new Intl.NumberFormat("pt-BR").format(num)
  }

  const formatarEnergia = (kwh: number) => {
    if (kwh >= 1000000) {
      return `${(kwh / 1000000).toFixed(1)} GWh`
    } else if (kwh >= 1000) {
      return `${(kwh / 1000).toFixed(1)} MWh`
    }
    return `${kwh.toFixed(1)} kWh`
  }

  const formatarPotencia = (kw: number) => {
    if (kw >= 1000) {
      return `${(kw / 1000).toFixed(1)} MW`
    }
    return `${kw.toFixed(1)} kW`
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usinas</CardTitle>
          <Factory className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatarNumero(metricas.totalUsinas)}</div>
          <p className="text-xs text-muted-foreground">Usinas ativas no sistema</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Potência Total</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatarPotencia(metricas.potenciaTotal)}</div>
          <p className="text-xs text-muted-foreground">Capacidade instalada</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Geração no Período</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatarEnergia(metricas.energiaNoPeriodo)}</div>
          <div className="flex items-center text-xs">
            {metricas.crescimentoNoPeriodo >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={metricas.crescimentoNoPeriodo >= 0 ? "text-green-500" : "text-red-500"}>
              {metricas.crescimentoNoPeriodo >= 0 ? "+" : ""}
              {metricas.crescimentoNoPeriodo.toFixed(1)}%
            </span>
            <span className="text-muted-foreground ml-1">vs período anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatarEnergia(metricas.mediaGeracaoDiaria)}</div>
          <p className="text-xs text-muted-foreground">Geração média por dia com dados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Consórcios</CardTitle>
          <Factory className="h-4 w-4 text-muted-foreground" /> {/* Or a more appropriate icon */}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatarNumero(metricas.totalConsorcios || 0)}</div>
          <p className="text-xs text-muted-foreground">Consórcios com usinas ativas</p>
        </CardContent>
      </Card>
    </div>
  )
}

export interface Usina {
  id: number
  nome: string
  distribuidora: string | null
  potencia: number | null
  consorcio?: string | null // Novo campo
  geracoes: GeracaoDiaria[]
}

export interface GeracaoDiaria {
  id: number
  usinaId: number
  usina?: Usina
  data: Date
  energiaKwh: number
  origem: string
}

export interface MetricasUsina {
  totalUsinas: number
  potenciaTotal: number
  energiaMensal: number
  energiaAnual: number
  mediaGeracaoDiaria: number
  crescimentoMensal: number
  totalConsorcios?: number // Novo campo
}

export interface FiltrosPeriodo {
  periodo: "diario" | "mensal" | "anual"
  dataInicio: Date
  dataFim: Date
  usinaId?: number
  consorcio?: string // Novo filtro
}

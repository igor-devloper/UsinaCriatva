export interface Usina {
  id: number
  nome: string
  distribuidora: string | null
  potencia: number | null
  consorcio?: string | null
  geracoes: GeracaoDiaria[]
}

export interface GeracaoDiaria {
  id: number
  usinaId: number
  usina?: Usina
  data: Date
  energiaKwh: number
  origem: string
  ocorrencia?: string | null // Opcional
  clima?: string | null // Opcional
}

export interface MetricasUsina {
  totalUsinas: number
  potenciaTotal: number
  energiaNoPeriodo: number
  mediaGeracaoDiaria: number
  crescimentoNoPeriodo: number
  totalConsorcios?: number
}

export interface FiltrosPeriodo {
  periodo: "diario" | "mensal" | "anual" | "custom"
  dataInicio: Date
  dataFim: Date
  usinaId?: number
  distribuidora?: string // Novo filtro
  consorcio?: string // Agora é um filtro direto
  potenciaSelecionada?: number
}

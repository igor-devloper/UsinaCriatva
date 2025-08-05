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
  energiaNoPeriodo: number // Renomeado de energiaMensal
  mediaGeracaoDiaria: number
  crescimentoNoPeriodo: number // Renomeado de crescimentoMensal
  totalConsorcios?: number
}

export interface FiltrosPeriodo {
  periodo: "diario" | "mensal" | "anual" | "custom" // Adicionado "custom" para período de datas
  dataInicio: Date
  dataFim: Date
  usinaId?: number
  consorcio?: string
  potenciaSelecionada?: number // Alterado: agora é uma potência específica
}

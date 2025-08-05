import jsPDF from "jspdf"
// IMPORTANTE: O import de jspdf-autotable DEVE vir DEPOIS de jspdf
import "jspdf-autotable"
import type { MetricasUsina, Usina, FiltrosPeriodo } from "@/types/usina"

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface DadosExportacao {
  metricas: MetricasUsina
  usinas: Usina[]
  filtros: FiltrosPeriodo
}

export function exportarPDF(dados: DadosExportacao) {
  const doc = new jsPDF()

  // Configurações
  const pageWidth = doc.internal.pageSize.width
  const margin = 20
  let yPosition = margin

  // Título
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("Relatório de Usinas Solares", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 15

  // Data de geração
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, pageWidth / 2, yPosition, { align: "center" })
  yPosition += 20

  // Filtros aplicados
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Filtros Aplicados:", margin, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Período: ${dados.filtros.periodo}`, margin, yPosition)
  yPosition += 5
  doc.text(`Data Início: ${dados.filtros.dataInicio.toLocaleDateString("pt-BR")}`, margin, yPosition)
  yPosition += 5
  doc.text(`Data Fim: ${dados.filtros.dataFim.toLocaleDateString("pt-BR")}`, margin, yPosition)
  yPosition += 5
  if (dados.filtros.usinaId) {
    const usina = dados.usinas.find((u) => u.id === dados.filtros.usinaId)
    doc.text(`Usina: ${usina?.nome || "N/A"}`, margin, yPosition)
    yPosition += 5
  }
  if (dados.filtros.consorcio) {
    doc.text(`Consórcio: ${dados.filtros.consorcio}`, margin, yPosition)
    yPosition += 5
  }
  yPosition += 10

  // Métricas
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Métricas Gerais:", margin, yPosition)
  yPosition += 15

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

  // Tabela de métricas
  doc.autoTable({
    startY: yPosition,
    head: [["Métrica", "Valor"]],
    body: [
      ["Total de Usinas", dados.metricas.totalUsinas.toString()],
      ["Potência Total", formatarPotencia(dados.metricas.potenciaTotal)],
      ["Geração no Período", formatarEnergia(dados.metricas.energiaMensal)],
      ["Média Diária", formatarEnergia(dados.metricas.mediaGeracaoDiaria)],
      ["Crescimento", `${dados.metricas.crescimentoMensal.toFixed(1)}%`],
      ["Total de Consórcios", dados.metricas.totalConsorcios?.toString() || "N/A"],
    ],
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: margin, right: margin },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 20

  // Verificar se precisa de nova página
  if (yPosition > doc.internal.pageSize.height - 60) {
    doc.addPage()
    yPosition = margin
  }

  // Tabela de usinas
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Detalhes das Usinas:", margin, yPosition)
  yPosition += 10

  const dadosTabela = dados.usinas.map((usina) => {
    const geracaoTotal = usina.geracoes?.reduce((acc, g) => acc + g.energiaKwh, 0) || 0
    return [
      usina.nome,
      usina.distribuidora || "N/A",
      usina.consorcio || "N/A",
      formatarPotencia(usina.potencia || 0),
      formatarEnergia(geracaoTotal),
      usina.geracoes?.length.toString() || "0",
    ]
  })

  doc.autoTable({
    startY: yPosition,
    head: [["Nome", "Distribuidora", "Consórcio", "Potência", "Geração Total", "Registros"]],
    body: dadosTabela,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: margin, right: margin },
    styles: { fontSize: 8 },
  })

  // Salvar o PDF
  const nomeArquivo = `relatorio-usinas-${new Date().toISOString().split("T")[0]}.pdf`
  doc.save(nomeArquivo)
}

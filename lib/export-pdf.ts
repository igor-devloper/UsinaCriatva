// ✅ Fallback universal para jsPDF + autoTable
let jsPDFLib: any
let autoTableLib: any

try {
  // 📦 CJS compatível com Webpack e Turbopack
  jsPDFLib = require("jspdf").jsPDF
  autoTableLib = require("jspdf-autotable")
} catch (error) {
  console.error("❌ Erro ao importar jsPDF ou autoTable com require():", error)
}

import type { MetricasUsina, Usina, FiltrosPeriodo } from "@/types/usina"

interface DadosExportacao {
  metricas: MetricasUsina
  usinas: Usina[]
  filtros: FiltrosPeriodo
}

export function exportarPDF(dados: DadosExportacao) {
  const doc = new jsPDFLib()

  // 🔍 Verificação de segurança
  if (typeof doc.autoTable !== "function") {
    console.error("❌ autoTable não está disponível no jsPDF.")
    alert("Erro ao gerar PDF: recurso de tabela indisponível.")
    return
  }

  // Configurações iniciais
  const pageWidth = doc.internal.pageSize.width
  const margin = 20
  let yPosition = margin

  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("Relatório de Usinas Solares", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 15

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, pageWidth / 2, yPosition, { align: "center" })
  yPosition += 20

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

  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Métricas Gerais:", margin, yPosition)
  yPosition += 15

  const formatarEnergia = (kwh: number | null | undefined) => {
    if (kwh === null || kwh === undefined || isNaN(kwh)) return "N/A"
    if (kwh >= 1_000_000) return `${(kwh / 1_000_000).toFixed(1)} GWh`
    if (kwh >= 1_000) return `${(kwh / 1_000).toFixed(1)} MWh`
    return `${kwh.toFixed(1)} kWh`
  }

  const formatarPotencia = (kw: number | null | undefined) => {
    if (kw === null || kw === undefined || isNaN(kw)) return "N/A"
    if (kw >= 1000) return `${(kw / 1000).toFixed(1)} MW`
    return `${kw.toFixed(1)} kW`
  }

  doc.autoTable({
    startY: yPosition,
    head: [["Métrica", "Valor"]],
    body: [
      ["Total de Usinas", dados.metricas.totalUsinas.toString()],
      ["Potência Total", formatarPotencia(dados.metricas.potenciaTotal)],
      ["Geração no Período", formatarEnergia(dados.metricas.energiaNoPeriodo)],
      ["Média Diária", formatarEnergia(dados.metricas.mediaGeracaoDiaria)],
      ["Crescimento", `${dados.metricas.crescimentoNoPeriodo.toFixed(1)}%`],
      ["Total de Consórcios", dados.metricas.totalConsorcios?.toString() || "N/A"],
    ],
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: margin, right: margin },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 20

  if (yPosition > doc.internal.pageSize.height - 60) {
    doc.addPage()
    yPosition = margin
  }

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

  const nomeArquivo = `relatorio-usinas-${new Date().toISOString().split("T")[0]}.pdf`
  doc.save(nomeArquivo)
}

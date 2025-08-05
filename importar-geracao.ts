import xlsx from 'xlsx'
import { PrismaClient } from '@prisma/client'
import path from 'path'

const prisma = new PrismaClient()

function parseDate(col: string): Date | null {
  const match = col.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (match) {
    const [_, dia, mes, ano] = match
    return new Date(`${ano}-${mes}-${dia}`)
  }
  return null
}

async function main() {
  const filePath = path.join(__dirname, 'planilha.xlsx') // troque para o caminho do seu arquivo
  const workbook = xlsx.readFile(filePath)

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json<any>(sheet, { defval: null })

    for (const linha of data) {
      const rawUsina = linha['__EMPTY'] || linha['Usina'] || linha[Object.keys(linha)[0]]
      const nomeUsina = String(rawUsina || '').trim()

      if (
        !nomeUsina ||
        nomeUsina.length < 3 ||
        nomeUsina.toLowerCase().includes('total') ||
        nomeUsina.toLowerCase().includes('período') ||
        nomeUsina.toLowerCase().includes('consórcio') ||
        nomeUsina.toLowerCase().includes('preenchido') ||
        nomeUsina.toLowerCase().includes('cálculo') ||
        nomeUsina.toLowerCase().includes('anos') ||
        nomeUsina.toLowerCase().includes('valor') ||
        /^\d{4}$/.test(nomeUsina)
      ) {
        continue
      }

      const nomeLimpo = nomeUsina.replace(/\s+/g, ' ')

      const usina = await prisma.usina.findFirst({
        where: { nome: { equals: nomeLimpo, mode: 'insensitive' } },
      })
      if (!usina) {
        console.warn(`🚫 Usina não encontrada: "${nomeUsina}"`)
        continue
      }

      for (const [coluna, valor] of Object.entries(linha)) {
        const dataGeracao = parseDate(coluna)
        const energiaKwh = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(',', '.'))

        if (!dataGeracao || isNaN(energiaKwh)) continue

        const jaExiste = await prisma.geracaoDiaria.findFirst({
          where: {
            usinaId: usina.id,
            data: dataGeracao,
          },
        })

        if (!jaExiste) {
          await prisma.geracaoDiaria.create({
            data: {
              usinaId: usina.id,
              data: dataGeracao,
              energiaKwh,
              ocorrencia: '',
              clima: '',
            },
          })
        }
      }
    }
  }

  console.log('✅ Importação concluída.')
}

main()
  .catch(e => console.error('❌ Erro:', e))
  .finally(() => prisma.$disconnect())

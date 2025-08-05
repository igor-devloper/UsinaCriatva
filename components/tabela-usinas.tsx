"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Usina } from "@/types/usina"

interface TabelaUsinasProps {
  usinas: Usina[]
}

export function TabelaUsinas({ usinas }: TabelaUsinasProps) {
  const formatarPotencia = (kw: number | null) => {
    if (!kw) return "N/A"
    if (kw >= 1000) {
      return `${(kw / 1000).toFixed(1)} MW`
    }
    return `${kw.toFixed(1)} kW`
  }

  const calcularGeracaoTotal = (usina: Usina) => {
    const total = usina.geracoes?.reduce((acc, geracao) => acc + geracao.energiaKwh, 0) || 0
    if (total >= 1000000) {
      return `${(total / 1000000).toFixed(1)} GWh`
    } else if (total >= 1000) {
      return `${(total / 1000).toFixed(1)} MWh`
    }
    return `${total.toFixed(1)} kWh`
  }

  const getStatusUsina = (usina: Usina) => {
    if (!usina.geracoes || usina.geracoes.length === 0) return "Sem dados"

    const ultimaGeracao = usina.geracoes[usina.geracoes.length - 1]
    const hoje = new Date()
    const dataUltimaGeracao = new Date(ultimaGeracao.data)
    const diasSemGeracao = Math.floor((hoje.getTime() - dataUltimaGeracao.getTime()) / (1000 * 60 * 60 * 24))

    if (diasSemGeracao <= 10) return "Ativa"
    if (diasSemGeracao <= 15) return "Alerta"
    return "Inativa"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativa":
        return "bg-green-100 text-green-800"
      case "Alerta":
        return "bg-yellow-100 text-yellow-800"
      case "Inativa":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usinas Cadastradas</CardTitle>
        <CardDescription>Lista completa das usinas e suas informações</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Distribuidora</TableHead>
                <TableHead>Consórcio</TableHead>
                <TableHead>Potência</TableHead>
                <TableHead>Geração Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usinas.map((usina) => {
                const status = getStatusUsina(usina)
                return (
                  <TableRow key={usina.id}>
                    <TableCell className="font-medium">{usina.nome}</TableCell>
                    <TableCell>{usina.distribuidora || "N/A"}</TableCell>
                    <TableCell>{usina.consorcio || "N/A"}</TableCell>
                    <TableCell>{formatarPotencia(usina.potencia)}</TableCell>
                    <TableCell>{calcularGeracaoTotal(usina)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(status)}>{status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

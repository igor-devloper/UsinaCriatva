  "use client"

  import type React from "react"

  import { useState } from "react"
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
  import { Calendar } from "@/components/ui/calendar"
  import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
  import { CalendarIcon, Plus } from "lucide-react"
  import { format } from "date-fns"
  import { ptBR } from "date-fns/locale"
  import { cn } from "@/lib/utils"
  import { toast } from "sonner" // Alterado para sonner
  import type { Usina } from "@/types/usina"

  interface FormAdicionarGeracaoProps {
    usinas: Usina[]
    onSuccess: () => void
  }

  export function FormAdicionarGeracao({ usinas, onSuccess }: FormAdicionarGeracaoProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
      usinaId: "",
      data: undefined as Date | undefined,
      energiaKwh: "",
      ocorrencia: "",
      clima: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      if (!formData.usinaId || !formData.data || !formData.energiaKwh || !formData.clima) {
        toast.error("Todos os campos são obrigatórios.") // Usando toast.error do sonner
        return
      }

      const promise = () =>
        fetch("/api/geracoes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usinaId: formData.usinaId,
            data: formData.data?.toISOString(),
            energiaKwh: formData.energiaKwh,
            ocorrencia: formData.ocorrencia,
            clima: formData.clima
          }),
        }).then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Erro desconhecido ao adicionar geração.")
          }
          return response.json()
        })

      toast.promise(promise, {
        loading: "Adicionando dados de geração...",
        success: (data) => {
          setFormData({
            usinaId: "",
            data: undefined,
            energiaKwh: "",
            ocorrencia: "",
            clima: ""
          })
          setOpen(false)
          onSuccess()
          return `Dados de geração para ${data.usina.nome} adicionados com sucesso!`
        },
        error: (error) => `Erro ao adicionar dados de geração: ${error.message}`,
      })
    }

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Geração
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Dados de Geração</DialogTitle>
            <DialogDescription>Adicione novos dados de geração de energia para uma usina específica.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usina">Usina</Label>
              <Select value={formData.usinaId} onValueChange={(value) => setFormData({ ...formData, usinaId: value })} >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma usina" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {usinas.map((usina) => (
                    <SelectItem key={usina.id} value={usina.id.toString()}>
                      {usina.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data da Geração</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data ? format(formData.data, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data}
                    onSelect={(date) => setFormData({ ...formData, data: date })}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="energia">Energia Gerada (kWh)</Label>
              <Input
                id="energia"
                type="number"
                step="0.1"
                placeholder="Ex: 1250.5"
                value={formData.energiaKwh}
                onChange={(e) => setFormData({ ...formData, energiaKwh: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ocorrencia">Ocorrencias</Label>
              <Input
                id="ocorrencia"
                placeholder="Ex: Internet fora do ar"
                value={formData.ocorrencia}
                onChange={(e) => setFormData({ ...formData, ocorrencia: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clima">Clima</Label>
              <Input
                id="clima"
                placeholder="Ex: Nublado"
                value={formData.clima}
                onChange={(e) => setFormData({ ...formData, clima: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

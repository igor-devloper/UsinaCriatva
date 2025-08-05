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
import { Plus } from "lucide-react"
import { toast } from "sonner" // Usando sonner

interface FormAdicionarUsinaProps {
  onSuccess: () => void
}

export function FormAdicionarUsina({ onSuccess }: FormAdicionarUsinaProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    distribuidora: "",
    consorcio: "",
    latitude: "",
    longitude: "",
    potencia: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome) {
      toast.error("O nome da usina é obrigatório.")
      return
    }

    const promise = () =>
      fetch("/api/usinas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.nome,
          distribuidora: formData.distribuidora || null,
          consorcio: formData.consorcio || null,
          latitude: formData.latitude ? Number.parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? Number.parseFloat(formData.longitude) : null,
          potencia: formData.potencia ? Number.parseFloat(formData.potencia) : null,
        }),
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro desconhecido ao adicionar usina.")
        }
        return response.json()
      })

    toast.promise(promise, {
      loading: "Adicionando usina...",
      success: (data) => {
        setFormData({
          nome: "",
          distribuidora: "",
          consorcio: "",
          latitude: "",
          longitude: "",
          potencia: "",
        })
        setOpen(false)
        onSuccess()
        return `Usina "${data.nome}" adicionada com sucesso!`
      },
      error: (error) => `Erro ao adicionar usina: ${error.message}`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Usina
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Usina</DialogTitle>
          <DialogDescription>Preencha os detalhes para cadastrar uma nova usina solar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Usina</Label>
            <Input
              id="nome"
              placeholder="Ex: Usina Solar Alpha"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="distribuidora">Distribuidora</Label>
            <Input
              id="distribuidora"
              placeholder="Ex: Cemig"
              value={formData.distribuidora}
              onChange={(e) => setFormData({ ...formData, distribuidora: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consorcio">Consórcio</Label>
            <Input
              id="consorcio"
              placeholder="Ex: Consórcio Prime 01"
              value={formData.consorcio}
              onChange={(e) => setFormData({ ...formData, consorcio: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="Ex: -20.345678"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="Ex: -43.123456"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="potencia">Potência (kW)</Label>
            <Input
              id="potencia"
              type="number"
              step="0.1"
              placeholder="Ex: 500.5"
              value={formData.potencia}
              onChange={(e) => setFormData({ ...formData, potencia: e.target.value })}
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

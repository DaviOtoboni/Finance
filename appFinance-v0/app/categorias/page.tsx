"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { AuthGuard } from "@/components/auth-guard"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import CategoryAlert from '@/components/CategoryAlert';

interface Category {
  id: string
  name: string
  limit_amount: number
  color: string
  spent?: number
}

const defaultColors = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
]

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    limit_amount: "",
    color: defaultColors[0],
  })
  const { toast } = useToast()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from("categories").select("*").eq("user_id", user.id).order("name")

      if (error) throw error

      // Calcular gastos por categoria no mês atual
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()

      const categoriesWithSpent = await Promise.all(
        (data || []).map(async (category) => {
          const { data: expenses } = await supabase
            .from("expenses")
            .select("amount")
            .eq("user_id", user.id)
            .eq("category_id", category.id)
            .gte("date", `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`)
            .lt("date", `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-01`)

          const spent = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0
          return { ...category, spent }
        }),
      )

      setCategories(categoriesWithSpent)
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update({
            name: formData.name,
            limit_amount: Number.parseFloat(formData.limit_amount) || 0,
            color: formData.color,
          })
          .eq("id", editingCategory.id)

        if (error) throw error
        toast({ title: "Sucesso", description: "Categoria atualizada!" })
      } else {
        const { error } = await supabase.from("categories").insert({
          user_id: user.id,
          name: formData.name,
          limit_amount: Number.parseFloat(formData.limit_amount) || 0,
          color: formData.color,
        })

        if (error) throw error
        toast({ title: "Sucesso", description: "Categoria criada!" })
      }

      setDialogOpen(false)
      setEditingCategory(null)
      setFormData({ name: "", limit_amount: "", color: defaultColors[0] })
      loadCategories()
    } catch (error) {
      console.error("Erro ao salvar categoria:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar a categoria",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      limit_amount: category.limit_amount.toString(),
      color: category.color,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria? Todos os gastos associados também serão removidos.")) {
      return
    }

    try {
      const { error } = await supabase.from("categories").delete().eq("id", categoryId)

      if (error) throw error
      toast({ title: "Sucesso", description: "Categoria excluída!" })
      loadCategories()
    } catch (error) {
      console.error("Erro ao excluir categoria:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const openNewDialog = () => {
    setEditingCategory(null)
    setFormData({ name: "", limit_amount: "", color: defaultColors[0] })
    setDialogOpen(true)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            {/* Removido título e subtítulo */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                  <DialogDescription>
                    {editingCategory
                      ? "Atualize os dados da categoria"
                      : "Crie uma nova categoria para organizar seus gastos"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Alimentação, Transporte..."
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="limit">Limite Mensal (R$)</Label>
                    <Input
                      id="limit"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={formData.limit_amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, limit_amount: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <div className="flex gap-2 flex-wrap">
                      {defaultColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            formData.color === color ? "border-gray-900" : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData((prev) => ({ ...prev, color }))}
                        />
                      ))}
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Salvando..." : editingCategory ? "Atualizar" : "Criar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Renderização das categorias */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id} className="relative">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: category.color }}>{category.name}</span>
                    {category.spent > category.limit_amount && (
                      <span className="ml-2">
                        <CategoryAlert
                          category={category.name}
                          spent={category.spent}
                          limit={category.limit_amount}
                          isExceeded={category.spent > category.limit_amount}
                        />
                      </span>
                    )}
                  </div>
                  {/* ...ações de editar/excluir... */}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Limite: {formatCurrency(category.limit_amount)}</span>
                    <span className="text-sm font-semibold">Gasto: {formatCurrency(category.spent || 0)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {categories.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">Nenhuma categoria criada ainda</p>
                <Button onClick={openNewDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira categoria
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

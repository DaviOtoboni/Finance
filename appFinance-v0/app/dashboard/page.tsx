"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { AuthGuard } from "@/components/auth-guard"
import { Navigation } from "@/components/navigation"
import {
  Car,
  Utensils,
  Plane,
  Home,
  Gamepad2,
  Wifi,
  DollarSign,
  HeartPulse,
  BookOpen,
  Star,
  Plus
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import CategoryAlert from '@/components/CategoryAlert';
import ExpenseCard from '@/components/ExpenseCard';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

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

const categoryIcons = [
  { name: "carro", icon: Car },
  { name: "comida", icon: Utensils },
  { name: "viagem", icon: Plane },
  { name: "lazer", icon: Home },
  { name: "jogos", icon: Gamepad2 },
  { name: "internet", icon: Wifi },
  { name: "dinheiro", icon: DollarSign },
  { name: "saude", icon: HeartPulse },
  { name: "educacao", icon: BookOpen },
  { name: "outros", icon: Star },
]

interface DashboardData {
  totalMonth: number
  totalToday: number
  categoriesOverLimit: Array<{
    name: string
    spent: number
    limit: number
    color: string
  }>
  recentExpenses: Array<{
    id: string
    amount: number
    description: string
    date: string
    category: string
    categoryColor: string
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalMonth: 0,
    totalToday: 0,
    categoriesOverLimit: [],
    recentExpenses: [],
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    limit_amount: "",
    icon: categoryIcons[0].name,
  });

  const openNewDialog = () => {
    setFormData({ name: "", limit_amount: "", icon: categoryIcons[0].name });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }
    setLoadingCategory(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from("categories").insert({
        user_id: user.id,
        name: formData.name,
        limit_amount: Number.parseFloat(formData.limit_amount) || 0,
        icon: formData.icon,
      });
      if (error) throw error;
      toast({ title: "Sucesso", description: "Categoria criada!" });
      setDialogOpen(false);
      setFormData({ name: "", limit_amount: "", icon: categoryIcons[0].name });
      loadDashboardData();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a categoria",
        variant: "destructive",
      });
    } finally {
      setLoadingCategory(false);
    }
  };

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()
      const today = now.toISOString().split("T")[0]

      // Total do mês
      const { data: monthlyExpenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("user_id", user.id)
        .gte("date", `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`)
        .lt("date", `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-01`)

      // Total do dia
      const { data: todayExpenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("user_id", user.id)
        .eq("date", today)

      // Categorias que ultrapassaram o limite
      const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .gt("limit_amount", 0)

      const categoriesOverLimit = []
      if (categories) {
        for (const category of categories) {
          const { data: categoryExpenses } = await supabase
            .from("expenses")
            .select("amount")
            .eq("user_id", user.id)
            .eq("category_id", category.id)
            .gte("date", `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`)
            .lt("date", `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-01`)

          const spent = categoryExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0
          if (spent > category.limit_amount) {
            categoriesOverLimit.push({
              name: category.name,
              spent,
              limit: category.limit_amount,
              color: category.color,
            })
          }
        }
      }

      // Gastos recentes
      const { data: recentExpenses } = await supabase
        .from("expenses")
        .select(`
          id,
          amount,
          description,
          date,
          categories!inner (name, color)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      setData({
        totalMonth: monthlyExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0,
        totalToday: todayExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0,
        categoriesOverLimit,
        recentExpenses:
          recentExpenses?.map((exp) => ({
            id: exp.id,
            amount: exp.amount,
            description: exp.description || "",
            date: exp.date,
            category: (exp.categories as any)?.name || "",
            categoryColor: (exp.categories as any)?.color || "#3B82F6",
          })) || [],
      })
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Categoria</DialogTitle>
                  <DialogDescription>
                    Crie uma nova categoria para organizar seus gastos
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
                    <Label>Ícone</Label>
                    <div className="flex gap-2 flex-wrap">
                      {categoryIcons.map(({ name, icon: Icon }) => (
                        <button
                          key={name}
                          type="button"
                          className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-colors ${
                            formData.icon === name ? "border-gray-900 bg-muted" : "border-gray-300 bg-background"
                          }`}
                          onClick={() => setFormData((prev) => ({ ...prev, icon: name }))}
                          aria-label={name}
                        >
                          <Icon className="h-6 w-6" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" disabled={loadingCategory} className="w-full">
                    {loadingCategory ? "Salvando..." : "Criar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {/* Removido grid de cartões de resumo de despesas por categoria */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Alertas visuais de categorias acima do limite */}
            {data.categoriesOverLimit.length > 0 && (
              <div className="bg-card text-foreground rounded-xl p-6">
                <div className="space-y-3">
                  {data.categoriesOverLimit.map((category, index) => (
                    <CategoryAlert
                      key={index}
                      category={category.name}
                      spent={category.spent}
                      limit={category.limit}
                      isExceeded={category.spent > category.limit}
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="bg-card text-foreground rounded-xl p-6">
              {/* Gastos recentes */}
              {data.recentExpenses.map((exp, idx) => (
                <div key={exp.id} className="mb-2 last:mb-0 bg-muted rounded p-2 flex items-center justify-between">
                  <span className="text-sm text-foreground">
                    {exp.category} • {exp.date}
                  </span>
                  <span className="font-semibold text-foreground">{formatCurrency(exp.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

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
  categories: Array<{
    id: string
    name: string
    limit_amount: number
    icon: string
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
    categories: [],
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
  // Estado para modal de gasto
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    categoryId: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  // Remover o filtro de gastos recentes para cálculo do spent por categoria
  // Adicionar estado para todos os gastos do mês
  const [allMonthExpenses, setAllMonthExpenses] = useState([]);

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

  const openExpenseDialog = () => {
    setExpenseForm({ categoryId: "", amount: "", description: "", date: new Date().toISOString().split("T")[0] });
    setExpenseDialogOpen(true);
  };
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.categoryId || !expenseForm.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    setExpenseLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from("expenses").insert({
        user_id: user.id,
        category_id: expenseForm.categoryId,
        amount: Number.parseFloat(expenseForm.amount),
        description: expenseForm.description,
        date: expenseForm.date,
      });
      if (error) throw error;
      toast({ title: "Sucesso", description: "Gasto adicionado com sucesso!" });
      setExpenseDialogOpen(false);
      setExpenseForm({ categoryId: "", amount: "", description: "", date: new Date().toISOString().split("T")[0] });
      loadDashboardData();
    } catch (error) {
      console.error("Erro ao adicionar gasto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o gasto",
        variant: "destructive",
      });
    } finally {
      setExpenseLoading(false);
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
        .select("*") // buscar todos os campos para uso posterior
        .eq("user_id", user.id)
        .gte("date", `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`)
        .lt("date", `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-01`)

      setAllMonthExpenses(monthlyExpenses || []);

      // Todas as categorias do usuário
      const { data: allCategories } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)

      // Gastos recentes (agora sem limite)
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
        // Remover .limit(5)

      setData({
        totalMonth: monthlyExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0,
        totalToday: monthlyExpenses?.filter(exp => exp.date === today).reduce((sum, exp) => sum + exp.amount, 0) || 0,
        categoriesOverLimit: [], // não usado mais
        categories: allCategories?.map((cat) => ({
          id: cat.id,
          name: cat.name,
          limit_amount: cat.limit_amount,
          icon: cat.icon,
        })) || [],
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
          {/* Removido título e subtítulo */}
          {/* Grid principal com containers organizados */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Container das Categorias - Lado Esquerdo */}
            <div className="bg-neutral-100 dark:bg-neutral-900 border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-foreground">Suas Categorias</h2>
                <div className="flex gap-2">
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openNewDialog} size="sm">
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
              </div>
              
              {/* Lista de Categorias */}
              <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-neutral-400 scrollbar-track-neutral-200 pr-2">
                {data.categories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma categoria criada ainda.</p>
                    <p className="text-sm">Clique em "Nova Categoria" para começar!</p>
                  </div>
                ) : (
                  data.categories.map((category) => {
                    const IconComponent = categoryIcons.find(ci => ci.name === category.icon)?.icon || Star;
                    // Calcular gasto do mês para a categoria usando allMonthExpenses
                    const categoryExpenses = allMonthExpenses.filter(exp => exp.category_id === category.id);
                    const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                    const isExceeded = category.limit_amount > 0 && spent > category.limit_amount;
                    return (
                      <div key={category.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{category.name}</p>
                            {category.limit_amount > 0 && (
                              <p className="text-sm text-muted-foreground">
                                Limite: {formatCurrency(category.limit_amount)}
                              </p>
                            )}
                          </div>
                        </div>
                        {isExceeded && (
                          <div className="w-60 max-w-xs">
                            <CategoryAlert
                              category={category.name}
                              spent={spent}
                              limit={category.limit_amount}
                              isExceeded={isExceeded}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Container dos Gastos Recentes - Lado Direito */}
            <div className="bg-neutral-100 dark:bg-neutral-900 border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground mb-0">Gastos Recentes</h2>
                <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openExpenseDialog} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Gasto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Gasto</DialogTitle>
                      <DialogDescription>Registre um novo gasto em uma categoria específica</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleExpenseSubmit} className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="category">Categoria *</Label>
                          <Select
                            value={expenseForm.categoryId}
                            onValueChange={(value) => setExpenseForm((prev) => ({ ...prev, categoryId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {data.categories.map((category) => {
                                const IconComponent = categoryIcons.find(ci => ci.name === category.icon)?.icon || Star;
                                return (
                                  <SelectItem key={category.id} value={category.id}>
                                    <div className="flex items-center gap-2">
                                      <span className="w-3 h-3 rounded-full bg-primary/30 flex items-center justify-center">
                                        <IconComponent className="h-3 w-3" />
                                      </span>
                                      {category.name}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amount">Valor (R$) *</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            value={expenseForm.amount}
                            onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Data</Label>
                        <Input
                          id="date"
                          type="date"
                          value={expenseForm.date}
                          onChange={(e) => setExpenseForm((prev) => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          placeholder="Descreva o gasto (opcional)"
                          value={expenseForm.description}
                          onChange={(e) => setExpenseForm((prev) => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <Button type="submit" disabled={expenseLoading} className="w-full">
                        {expenseLoading ? "Adicionando..." : "Adicionar Gasto"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-neutral-400 scrollbar-track-neutral-200 pr-2">
                {data.recentExpenses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum gasto registrado ainda.</p>
                    <p className="text-sm">Adicione gastos para ver aqui!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.recentExpenses.map((exp) => (
                      <div key={exp.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full">
                            <DollarSign className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{exp.category}</p>
                            <p className="text-sm text-muted-foreground">{exp.date}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-foreground">{formatCurrency(exp.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

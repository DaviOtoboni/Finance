"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { AuthGuard } from "@/components/auth-guard"
import { Navigation } from "@/components/navigation"
import { TrendingUp, Calendar, AlertTriangle, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import CategoryAlert from '@/components/CategoryAlert';
import ExpenseCard from '@/components/ExpenseCard';

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
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Cartões de resumo de despesas por categoria */}
            {data.recentExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                title={expense.category}
                amount={expense.amount}
                icon="ri-wallet-3-line"
                color="bg-blue-500"
              />
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Alertas visuais de categorias acima do limite */}
            {data.categoriesOverLimit.length > 0 && (
              <Card>
                <CardHeader>
                  {/* Removido CardTitle e CardDescription */}
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                {/* Removido CardTitle e CardDescription */}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: expense.categoryColor }} />
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {expense.category} • {new Date(expense.date).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{formatCurrency(expense.amount)}</Badge>
                    </div>
                  ))}
                  {data.recentExpenses.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">Nenhum gasto registrado ainda</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { AuthGuard } from "@/components/auth-guard"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"
import { BarChart3, PieChart, Download, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import jsPDF from "jspdf";
import "jspdf-autotable";

interface ExpenseData {
  category: string
  amount: number
  color: string
  count: number
}

interface DailyExpense {
  date: string
  amount: number
}

export default function RelatoriosPage() {
  const [categoryData, setCategoryData] = useState<ExpenseData[]>([])
  const [dailyData, setDailyData] = useState<DailyExpense[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadReportData()
  }, [selectedMonth, selectedYear])

  const loadReportData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Dados por categoria
      const { data: expenses } = await supabase
        .from("expenses")
        .select(`
          amount,
          date,
          categories (name, color)
        `)
        .eq("user_id", user.id)
        .gte("date", `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}-01`)
        .lt("date", `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, "0")}-01`)

      // Processar dados por categoria
      const categoryMap = new Map<string, ExpenseData>()
      const dailyMap = new Map<string, number>()

      expenses?.forEach((expense) => {
        const category = expense.categories as any
        const categoryName = category?.name || "Sem categoria"
        const categoryColor = category?.color || "#3B82F6"

        // Dados por categoria
        if (categoryMap.has(categoryName)) {
          const existing = categoryMap.get(categoryName)!
          categoryMap.set(categoryName, {
            ...existing,
            amount: existing.amount + expense.amount,
            count: existing.count + 1,
          })
        } else {
          categoryMap.set(categoryName, {
            category: categoryName,
            amount: expense.amount,
            color: categoryColor,
            count: 1,
          })
        }

        // Dados diários
        const date = expense.date
        dailyMap.set(date, (dailyMap.get(date) || 0) + expense.amount)
      })

      setCategoryData(Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount))
      setDailyData(
        Array.from(dailyMap.entries())
          .map(([date, amount]) => ({ date, amount }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      )
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os relatórios",
        variant: "destructive",
      })
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

  const exportToCSV = () => {
    const csvContent = [
      ["Categoria", "Valor", "Quantidade de Gastos"],
      ...categoryData.map((item) => [item.category, item.amount.toString(), item.count.toString()]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-${selectedMonth}-${selectedYear}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Sucesso",
      description: "Relatório exportado em CSV!",
    })
  }

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de Gastos por Categoria", 14, 18);
    doc.setFontSize(12);
    doc.text(`Período: ${months.find((m) => m.value === selectedMonth)?.label} / ${selectedYear}`, 14, 28);

    // Cabeçalho da tabela
    const tableColumn = ["Categoria", "Valor (R$)", "Quantidade de Gastos"];
    const tableRows = categoryData.map((item) => [
      item.category,
      item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
      item.count.toString(),
    ]);

    // Adiciona cabeçalho e linhas
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
    });

    doc.save(`relatorio-${selectedMonth}-${selectedYear}.pdf`);
  };

  const totalAmount = categoryData.reduce((sum, item) => sum + item.amount, 0)
  const maxCategoryAmount = Math.max(...categoryData.map((item) => item.amount), 0)
  const maxDailyAmount = Math.max(...dailyData.map((item) => item.amount), 0)

  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            {/* Removido título e subtítulo */}
            <div className="flex gap-4">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button onClick={exportToPDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Gráfico de Pizza - Gastos por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Gastos por Categoria
                </CardTitle>
                <CardDescription>
                  Distribuição dos gastos de {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((item, index) => {
                    const percentage = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-medium">{item.category}</span>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{formatCurrency(item.amount)}</Badge>
                            <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              backgroundColor: item.color,
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {categoryData.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      Nenhum gasto registrado no período selecionado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Gastos Diários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Gastos Diários
                </CardTitle>
                <CardDescription>Evolução dos gastos ao longo do mês</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {dailyData.map((item, index) => {
                    const percentage = maxDailyAmount > 0 ? (item.amount / maxDailyAmount) * 100 : 0
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-16 text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-4 relative">
                            <div
                              className="bg-blue-500 h-4 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {dailyData.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      Nenhum gasto registrado no período selecionado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Resumo do Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
                  <div className="text-sm text-muted-foreground">Total Gasto</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{categoryData.length}</div>
                  <div className="text-sm text-muted-foreground">Categorias</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{dailyData.length}</div>
                  <div className="text-sm text-muted-foreground">Dias com Gastos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {dailyData.length > 0 ? formatCurrency(totalAmount / dailyData.length) : "R$ 0,00"}
                  </div>
                  <div className="text-sm text-muted-foreground">Média Diária</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Plus, Edit, Trash2, Calendar, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FixedAccount {
  id: string
  name: string
  amount: number
  due_day: number
  is_paid: boolean
  month: number
  year: number
}

export default function ContasFixasPage() {
  const [accounts, setAccounts] = useState<FixedAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<FixedAccount | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    due_day: "",
  })
  const { toast } = useToast()

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("fixed_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .order("due_day")

      if (error) throw error
      setAccounts(data || [])
    } catch (error) {
      console.error("Erro ao carregar contas fixas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as contas fixas",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.amount || !formData.due_day) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
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

      if (editingAccount) {
        const { error } = await supabase
          .from("fixed_accounts")
          .update({
            name: formData.name,
            amount: Number.parseFloat(formData.amount),
            due_day: Number.parseInt(formData.due_day),
          })
          .eq("id", editingAccount.id)

        if (error) throw error
        toast({ title: "Sucesso", description: "Conta atualizada!" })
      } else {
        const { error } = await supabase.from("fixed_accounts").insert({
          user_id: user.id,
          name: formData.name,
          amount: Number.parseFloat(formData.amount),
          due_day: Number.parseInt(formData.due_day),
          month: currentMonth,
          year: currentYear,
          is_paid: false,
        })

        if (error) throw error
        toast({ title: "Sucesso", description: "Conta criada!" })
      }

      setDialogOpen(false)
      setEditingAccount(null)
      setFormData({ name: "", amount: "", due_day: "" })
      loadAccounts()
    } catch (error) {
      console.error("Erro ao salvar conta:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar a conta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePaid = async (accountId: string, isPaid: boolean) => {
    try {
      const { error } = await supabase.from("fixed_accounts").update({ is_paid: !isPaid }).eq("id", accountId)

      if (error) throw error
      loadAccounts()
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (account: FixedAccount) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      amount: account.amount.toString(),
      due_day: account.due_day.toString(),
    })
    setDialogOpen(true)
  }

  const handleDelete = async (accountId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conta?")) return

    try {
      const { error } = await supabase.from("fixed_accounts").delete().eq("id", accountId)

      if (error) throw error
      toast({ title: "Sucesso", description: "Conta excluída!" })
      loadAccounts()
    } catch (error) {
      console.error("Erro ao excluir conta:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conta",
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
    setEditingAccount(null)
    setFormData({ name: "", amount: "", due_day: "" })
    setDialogOpen(true)
  }

  const totalAmount = accounts.reduce((sum, account) => sum + account.amount, 0)
  const paidAmount = accounts.filter((account) => account.is_paid).reduce((sum, account) => sum + account.amount, 0)
  const pendingAmount = totalAmount - paidAmount

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold">Contas Fixas</h1>
              <p className="text-muted-foreground">
                Gerencie suas contas mensais de{" "}
                {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Conta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAccount ? "Editar Conta" : "Nova Conta Fixa"}</DialogTitle>
                  <DialogDescription>
                    {editingAccount ? "Atualize os dados da conta fixa" : "Adicione uma nova conta mensal recorrente"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Conta *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Aluguel, Internet, Energia..."
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_day">Dia do Vencimento *</Label>
                    <Input
                      id="due_day"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="Ex: 15"
                      value={formData.due_day}
                      onChange={(e) => setFormData((prev) => ({ ...prev, due_day: e.target.value }))}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Salvando..." : editingAccount ? "Atualizar" : "Criar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Resumo */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="bg-neutral-100 dark:bg-neutral-900 border border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total das Contas</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-100 dark:bg-neutral-900 border border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagas</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-100 dark:bg-neutral-900 border border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Contas */}
          <div className="grid gap-4">
            {accounts.map((account) => {
              const isOverdue = account.due_day < currentDate.getDate() && !account.is_paid

              return (
                <Card key={account.id} className={isOverdue ? "border-red-200 bg-red-50" : ""}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={account.is_paid}
                          onCheckedChange={() => handleTogglePaid(account.id, account.is_paid)}
                        />
                        <div>
                          <h3 className={`font-medium ${account.is_paid ? "line-through text-muted-foreground" : ""}`}>
                            {account.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Vencimento: dia {account.due_day}
                            {isOverdue && <span className="text-red-600 ml-2">(Em atraso)</span>}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge variant={account.is_paid ? "default" : "secondary"}>
                          {formatCurrency(account.amount)}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(account.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {accounts.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">Nenhuma conta fixa cadastrada para este mês</p>
                <Button onClick={openNewDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar primeira conta
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

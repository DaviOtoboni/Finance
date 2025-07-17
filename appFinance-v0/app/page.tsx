"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signInWithGoogle } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { TrendingUp, PieChart, AlertTriangle, FileText } from "lucide-react"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        window.location.href = "/dashboard"
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        window.location.href = "/dashboard"
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      console.error("Erro ao fazer login:", error)
      setLoading(false)
    }
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Controle suas Finanças Pessoais</h1>
          <p className="text-xl text-gray-600 mb-8">
            Organize seus gastos, defina limites e acompanhe suas finanças em tempo real
          </p>
          <Button onClick={handleGoogleSignIn} disabled={loading} size="lg" className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Entrando..." : "Entrar com Google"}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Controle de Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Acompanhe seus gastos diários e mensais por categoria</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle className="text-lg">Limites por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Defina limites e receba alertas quando ultrapassá-los</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <PieChart className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Relatórios Visuais</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Visualize seus gastos com gráficos de barras e pizza</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Exportação</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Exporte seus dados em formato CSV e PDF</CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

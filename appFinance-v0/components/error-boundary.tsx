"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle>Algo deu errado</CardTitle>
              <CardDescription>Ocorreu um erro inesperado. Tente recarregar a página.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => window.location.reload()} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar Página
              </Button>
              {process.env.NODE_ENV === "development" && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground">Detalhes do erro</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">{this.state.error?.stack}</pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

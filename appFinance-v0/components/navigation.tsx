"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/adicionar-gasto", label: "Adicionar Gasto" },
  { href: "/categorias", label: "Categorias" },
  { href: "/contas-fixas", label: "Contas Fixas" },
  { href: "/relatorios", label: "Relatórios" },
]

export function Navigation() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/"
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300">
            <div
              className="flex gap-1 md:gap-2 min-w-max px-2 md:px-0 justify-center md:justify-center"
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} style={{ scrollSnapAlign: 'center' }}>
                  <Button
                    variant={pathname === item.href ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "whitespace-nowrap text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="ml-4 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  )
}
